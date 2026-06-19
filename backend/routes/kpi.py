import calendar
import zlib
from datetime import date
from io import BytesIO
from pathlib import Path
from statistics import mean, pstdev
from xml.sax.saxutils import escape
from zipfile import ZIP_DEFLATED, ZipFile

from fastapi import APIRouter, Depends, Query, Response
from PIL import Image
from sqlalchemy import case, distinct, func
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database import SessionLocal
from models import Attendance, Course, Enrollment, Payment, Student


router = APIRouter(prefix="/kpi", tags=["kpi"])

TUITION_AMOUNT = 1300
SPECIALTIES = ["Développement Informatique", "Financier Comptable"]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def month_bounds(value):
    year, month = [int(part) for part in value.split("-")]
    return date(year, month, 1), date(year, month, calendar.monthrange(year, month)[1])


def effective_dates(start_date=None, end_date=None, academic_month=None):
    if not academic_month:
        return start_date, end_date
    month_start, month_end = month_bounds(academic_month)
    return max(start_date, month_start) if start_date else month_start, min(end_date, month_end) if end_date else month_end


def apply_date_range(query, column, start_date=None, end_date=None):
    if start_date:
        query = query.filter(column >= start_date)
    if end_date:
        query = query.filter(column <= end_date)
    return query


def apply_student_filters(query, specialty=None, class_name=None):
    if specialty:
        query = query.filter(Student.specialty == specialty)
    if class_name:
        query = query.filter(Student.class_name == class_name)
    return query


def filtered_student_ids(db, specialty=None, class_name=None, module_id=None):
    query = db.query(Student.id)
    query = apply_student_filters(query, specialty, class_name)
    if module_id:
        query = query.join(Enrollment, Student.id == Enrollment.student_id).filter(
            Enrollment.course_id == module_id
        )
    return query.distinct().subquery()


def months_from_model_dates(db, *columns):
    months = set()
    for column in columns:
        rows = db.query(column).filter(column.isnot(None)).distinct().all()
        for (value,) in rows:
            if value:
                months.add(value.strftime("%Y-%m"))
    return sorted(months)


def available_months(db):
    return months_from_model_dates(db, Payment.date, Attendance.date, Enrollment.date)


def tuition_months(db):
    return months_from_model_dates(db, Payment.date)


def payment_month_count(db, start_date=None, end_date=None, academic_month=None):
    start_date, end_date = effective_dates(start_date, end_date, academic_month)
    count = 0
    for month in tuition_months(db):
        month_start, month_end = month_bounds(month)
        if start_date and month_end < start_date:
            continue
        if end_date and month_start > end_date:
            continue
        count += 1
    return count


def month_label(value):
    return value.strftime("%Y-%m") if value else ""


def next_month(value):
    year, month = [int(part) for part in value.split("-")]
    return f"{year + 1}-01" if month == 12 else f"{year}-{month + 1:02d}"


def filtered_population(db, specialty=None, class_name=None, module_id=None):
    query = db.query(Student)
    query = apply_student_filters(query, specialty, class_name)
    if module_id:
        query = query.filter(Student.id.in_(filtered_student_ids(db, specialty, class_name, module_id)))
    return query


def payment_query(db, start_date=None, end_date=None, specialty=None, module_id=None, class_name=None):
    query = db.query(Payment).join(Student, Payment.student_id == Student.id)
    query = apply_student_filters(query, specialty, class_name)
    if module_id:
        query = query.filter(Payment.student_id.in_(filtered_student_ids(db, specialty, class_name, module_id)))
    return apply_date_range(query, Payment.date, start_date, end_date)


def attendance_query(db, start_date=None, end_date=None, specialty=None, module_id=None, class_name=None):
    query = db.query(Attendance).join(Student, Attendance.student_id == Student.id)
    query = apply_student_filters(query, specialty, class_name)
    if module_id:
        query = query.filter(Attendance.course_id == module_id)
    return apply_date_range(query, Attendance.date, start_date, end_date)


def enrollment_query(db, start_date=None, end_date=None, specialty=None, module_id=None, class_name=None):
    query = db.query(Enrollment).join(Student, Enrollment.student_id == Student.id)
    query = apply_student_filters(query, specialty, class_name)
    if module_id:
        query = query.filter(Enrollment.course_id == module_id)
    return apply_date_range(query, Enrollment.date, start_date, end_date)


def risk_students(db, start_date=None, end_date=None, specialty=None, module_id=None, class_name=None):
    base = attendance_query(db, start_date, end_date, specialty, module_id, class_name)
    rows = (
        base.with_entities(
            Student.id,
            Student.name,
            Student.specialty,
            Student.class_name,
            func.count(Attendance.id).label("records"),
            func.sum(case((Attendance.status == "absent", 1), else_=0)).label("absences"),
        )
        .group_by(Student.id, Student.name, Student.specialty, Student.class_name)
        .all()
    )
    results = []
    for row in rows:
        absences = int(row.absences or 0)
        absence_rate = round(absences / row.records * 100, 2) if row.records else 0
        if absences >= 3 and absence_rate >= 20:
            results.append(
                {
                    "student_id": row.id,
                    "student": row.name,
                    "specialty": row.specialty,
                    "class_name": row.class_name,
                    "absences": absences,
                    "absence_rate": absence_rate,
                }
            )
    return sorted(results, key=lambda item: (-item["absence_rate"], -item["absences"]))


def dashboard_summary_data(
    db, start_date=None, end_date=None, academic_month=None,
    specialty=None, module_id=None, class_name=None,
):
    start_date, end_date = effective_dates(start_date, end_date, academic_month)
    population = filtered_population(db, specialty, class_name, module_id)
    students = population.count()

    revenue = float(
        payment_query(db, start_date, end_date, specialty, module_id, class_name)
        .with_entities(func.sum(Payment.amount))
        .scalar()
        or 0
    )
    expected_revenue = students * TUITION_AMOUNT * payment_month_count(
        db, start_date, end_date, academic_month
    )

    attendance = attendance_query(db, start_date, end_date, specialty, module_id, class_name)
    attendance_records = attendance.count()
    present = attendance.filter(Attendance.status == "present").count()
    absences = attendance.filter(Attendance.status == "absent").count()

    specialty_counts = {
        name: population.filter(Student.specialty == name).count()
        for name in SPECIALTIES
    }

    return {
        "students": students,
        "revenue": revenue,
        "expected_revenue": expected_revenue,
        "collection_rate": round(revenue / expected_revenue * 100, 2) if expected_revenue else 0,
        "attendance_rate": round(present / attendance_records * 100, 2) if attendance_records else 0,
        "absences": absences,
        "enrollments": enrollment_query(
            db, None, None, specialty, module_id, class_name
        ).with_entities(func.count(distinct(Enrollment.student_id))).scalar() or 0,
        "development_students": specialty_counts["Développement Informatique"],
        "finance_students": specialty_counts["Financier Comptable"],
        "students_at_risk": len(
            risk_students(db, start_date, end_date, specialty, module_id, class_name)
        ),
        "present": present,
        "attendance_records": attendance_records,
    }


def trend_data(
    db, start_date=None, end_date=None, academic_month=None,
    specialty=None, module_id=None, class_name=None,
):
    start_date, end_date = effective_dates(start_date, end_date, academic_month)
    month_payment = func.date_trunc("month", Payment.date)
    revenue_rows = (
        payment_query(db, start_date, end_date, specialty, module_id, class_name)
        .with_entities(month_payment, func.sum(Payment.amount))
        .group_by(month_payment)
        .order_by(month_payment)
        .all()
    )
    population_count = filtered_population(db, specialty, class_name, module_id).count()
    revenue_by_month = {
        month_label(row[0]): float(row[1] or 0)
        for row in revenue_rows
    }
    all_available_months = available_months(db)
    all_tuition_months = set(tuition_months(db))
    selected_months = []
    for month in all_available_months:
        month_start, month_end = month_bounds(month)
        if start_date and month_end < start_date:
            continue
        if end_date and month_start > end_date:
            continue
        selected_months.append(month)

    month_enrollment = func.date_trunc("month", Enrollment.date)
    enrollment_rows = (
        enrollment_query(db, None, None, specialty, module_id, class_name)
        .with_entities(month_enrollment, func.count(distinct(Enrollment.student_id)))
        .group_by(month_enrollment)
        .order_by(month_enrollment)
        .all()
    )

    month_attendance = func.date_trunc("month", Attendance.date)
    attendance_rows = (
        attendance_query(db, start_date, end_date, specialty, module_id, class_name)
        .with_entities(
            month_attendance,
            func.count(Attendance.id),
            func.sum(case((Attendance.status == "present", 1), else_=0)),
            func.sum(case((Attendance.status == "absent", 1), else_=0)),
        )
        .group_by(month_attendance)
        .order_by(month_attendance)
        .all()
    )

    return {
        "revenue": [
            {
                "month": month,
                "revenue": revenue_by_month.get(month, 0),
                "expected_revenue": population_count * TUITION_AMOUNT if month in all_tuition_months else 0,
                "paid_installments": round(revenue_by_month.get(month, 0) / TUITION_AMOUNT, 2),
                "expected_installments": population_count if month in all_tuition_months else 0,
            }
            for month in selected_months
        ],
        "enrollments": [
            {"month": month_label(row[0]), "enrollments": int(row[1] or 0)}
            for row in enrollment_rows
        ],
        "attendance": [
            {
                "month": month_label(row[0]),
                "attendance_rate": round((row[2] or 0) / row[1] * 100, 2) if row[1] else 0,
                "present": int(row[2] or 0),
                "absent": int(row[3] or 0),
            }
            for row in attendance_rows
        ],
    }


def specialty_breakdown_data(
    db, start_date=None, end_date=None, academic_month=None,
    specialty=None, module_id=None, class_name=None,
):
    start_date, end_date = effective_dates(start_date, end_date, academic_month)
    results = []
    for name in SPECIALTIES:
        if specialty and specialty != name:
            continue
        students = filtered_population(db, name, class_name, module_id).count()
        revenue = float(
            payment_query(db, start_date, end_date, name, module_id, class_name)
            .with_entities(func.sum(Payment.amount))
            .scalar()
            or 0
        )
        attendance = attendance_query(db, start_date, end_date, name, module_id, class_name)
        total = attendance.count()
        present = attendance.filter(Attendance.status == "present").count()
        results.append(
            {
                "specialty": name,
                "students": students,
                "revenue": revenue,
                "attendance_rate": round(present / total * 100, 2) if total else 0,
                "absences": total - present,
            }
        )
    return results


def module_analysis_data(
    db, start_date=None, end_date=None, academic_month=None,
    specialty=None, module_id=None, class_name=None,
):
    start_date, end_date = effective_dates(start_date, end_date, academic_month)
    query = (
        db.query(
            Course.id,
            Course.title,
            Course.specialty,
            func.count(Attendance.id).label("records"),
            func.sum(case((Attendance.status == "absent", 1), else_=0)).label("absences"),
        )
        .join(Attendance, Course.id == Attendance.course_id)
        .join(Student, Attendance.student_id == Student.id)
    )
    query = apply_student_filters(query, specialty, class_name)
    query = apply_date_range(query, Attendance.date, start_date, end_date)
    if module_id:
        query = query.filter(Course.id == module_id)
    rows = (
        query.group_by(Course.id, Course.title, Course.specialty)
        .order_by(func.sum(case((Attendance.status == "absent", 1), else_=0)).desc())
        .all()
    )
    return [
        {
            "module_id": row.id,
            "module": row.title,
            "specialty": row.specialty,
            "attendance_rate": round((row.records - (row.absences or 0)) / row.records * 100, 2)
            if row.records else 0,
            "absences": int(row.absences or 0),
            "records": row.records,
        }
        for row in rows
    ]


def module_popularity_data(
    db, start_date=None, end_date=None, academic_month=None,
    specialty=None, module_id=None, class_name=None,
):
    query = (
        db.query(
            Course.id,
            Course.title,
            Course.specialty,
            func.count(distinct(Enrollment.student_id)).label("students"),
        )
        .join(Enrollment, Course.id == Enrollment.course_id)
        .join(Student, Enrollment.student_id == Student.id)
    )
    query = apply_student_filters(query, specialty, class_name)
    if module_id:
        query = query.filter(Course.id == module_id)
    rows = (
        query.group_by(Course.id, Course.title, Course.specialty)
        .order_by(func.count(distinct(Enrollment.student_id)).desc(), Course.title)
        .all()
    )
    return [
        {
            "module_id": row.id,
            "module": row.title,
            "specialty": row.specialty,
            "students": row.students,
        }
        for row in rows
    ]


def linear_prediction(points, value_key, output_key, periods=3):
    if not points:
        return []
    values = [float(item[value_key]) for item in points]
    if len(values) == 1:
        slope = 0
        intercept = values[0]
    else:
        xs = list(range(len(values)))
        x_mean = mean(xs)
        y_mean = mean(values)
        denominator = sum((x - x_mean) ** 2 for x in xs)
        slope = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, values)) / denominator if denominator else 0
        intercept = y_mean - slope * x_mean
    month = points[-1]["month"]
    results = []
    for offset in range(1, periods + 1):
        month = next_month(month)
        value = max(0, round(intercept + slope * (len(values) - 1 + offset), 2))
        results.append({"month": month, output_key: value})
    return results


def z_score_anomalies(points, value_key, anomaly_type):
    values = [float(item[value_key]) for item in points]
    if len(values) < 3 or pstdev(values) == 0:
        return []
    center = mean(values)
    deviation = pstdev(values)
    results = []
    for item, value in zip(points, values):
        score = round((value - center) / deviation, 2)
        if abs(score) >= 1.5:
            results.append(
                {
                    "type": anomaly_type,
                    "month": item["month"],
                    "value": round(value, 2),
                    "z_score": score,
                    "direction": "élevé" if score > 0 else "faible",
                }
            )
    return results


def kmeans(features, clusters=3, iterations=20):
    if not features:
        return []
    clusters = min(clusters, len(features))
    ordered = sorted(features, key=lambda item: item["attendance_rate"])
    centroids = [
        [ordered[round(index * (len(ordered) - 1) / max(clusters - 1, 1))][key] for key in ("attendance_rate", "payment_rate", "absence_rate")]
        for index in range(clusters)
    ]
    assignments = [0] * len(features)
    for _ in range(iterations):
        for index, item in enumerate(features):
            vector = [item["attendance_rate"], item["payment_rate"], item["absence_rate"]]
            assignments[index] = min(
                range(clusters),
                key=lambda cluster: sum((vector[position] - centroids[cluster][position]) ** 2 for position in range(3)),
            )
        new_centroids = []
        for cluster in range(clusters):
            members = [features[index] for index, value in enumerate(assignments) if value == cluster]
            if not members:
                new_centroids.append(centroids[cluster])
                continue
            new_centroids.append(
                [
                    mean(member[key] for member in members)
                    for key in ("attendance_rate", "payment_rate", "absence_rate")
                ]
            )
        if new_centroids == centroids:
            break
        centroids = new_centroids
    ranking = sorted(range(clusters), key=lambda cluster: centroids[cluster][0])
    labels = {}
    label_names = ["Intervention requise", "Suivi régulier", "Forte implication"]
    for rank, cluster in enumerate(ranking):
        labels[cluster] = label_names[min(rank, len(label_names) - 1)]
    return [labels[value] for value in assignments]


def ai_data(
    db, start_date=None, end_date=None, academic_month=None,
    specialty=None, module_id=None, class_name=None,
):
    start_date, end_date = effective_dates(start_date, end_date, academic_month)
    trends = trend_data(
        db, start_date, end_date, None, specialty, module_id, class_name
    )
    students = filtered_population(db, specialty, class_name, module_id).order_by(Student.name).all()
    expected_payments = payment_month_count(db, start_date, end_date, academic_month)
    feature_rows = []
    for student in students:
        attendance = attendance_query(db, start_date, end_date, student.specialty, module_id, student.class_name).filter(
            Attendance.student_id == student.id
        )
        total = attendance.count()
        absences = attendance.filter(Attendance.status == "absent").count()
        present = total - absences
        paid_amount = float(
            payment_query(
                db, start_date, end_date, student.specialty, module_id, student.class_name
            )
            .filter(Payment.student_id == student.id)
            .with_entities(func.sum(Payment.amount))
            .scalar()
            or 0
        )
        attendance_rate = round(present / total * 100, 2) if total else 0
        expected_amount = expected_payments * TUITION_AMOUNT
        payment_rate = min(
            100,
            round(paid_amount / expected_amount * 100, 2) if expected_amount else 0,
        )
        feature_rows.append(
            {
                "student_id": student.id,
                "student": student.name,
                "specialty": student.specialty,
                "class_name": student.class_name,
                "attendance_rate": attendance_rate,
                "payment_rate": payment_rate,
                "absence_rate": round(absences / total * 100, 2) if total else 0,
                "absences": absences,
            }
        )
    labels = kmeans(feature_rows)
    for row, label in zip(feature_rows, labels):
        row["segment"] = label

    anomalies = z_score_anomalies(trends["attendance"], "attendance_rate", "Présence")
    anomalies += z_score_anomalies(trends["revenue"], "revenue", "Encaissements")
    revenue_predictions = linear_prediction(
        trends["revenue"], "revenue", "predicted_revenue", periods=4
    )[1:]
    return {
        "prediction": {
            "method": "Régression linéaire sur les encaissements mensuels",
            "reason": "Les inscriptions ont lieu uniquement à la rentrée. La prévision porte donc sur les encaissements, qui varient réellement selon les retards et régularisations.",
            "next_months": revenue_predictions,
        },
        "anomalies": {
            "method": "Détection d’anomalies par score Z",
            "reason": "Cette méthode signale les baisses inhabituelles de présence et les variations anormales d’encaissement avec un calcul facile à expliquer.",
            "items": anomalies,
        },
        "risk": {
            "method": "Seuil d’absences et taux d’absence",
            "reason": "Un stagiaire est à risque à partir de trois absences et d’un taux d’absence supérieur ou égal à 20 %.",
            "students": risk_students(db, start_date, end_date, specialty, module_id, class_name),
        },
        "segmentation": {
            "method": "K-Means sur la présence, le paiement et les absences",
            "reason": "Trois groupes explicables permettent d’identifier les stagiaires nécessitant une intervention, un suivi régulier ou présentant une forte implication.",
            "students": feature_rows,
        },
    }


def filter_payload(start_date, end_date, academic_month, specialty, module_id, class_name):
    return {
        "start_date": str(start_date) if start_date else None,
        "end_date": str(end_date) if end_date else None,
        "academic_month": academic_month,
        "specialty": specialty,
        "module_id": module_id,
        "class_name": class_name,
    }


@router.get("/filters")
def filters(user=Depends(get_current_user), db: Session = Depends(get_db)):
    date_values = [
        value
        for column in (Payment.date, Attendance.date, Enrollment.date)
        for (value,) in db.query(column).filter(column.isnot(None)).distinct().all()
        if value
    ]
    return {
        "specialties": SPECIALTIES,
        "classes": [
            row[0] for row in db.query(Student.class_name).distinct().order_by(Student.class_name).all()
        ],
        "modules": [
            {"id": row.id, "title": row.title, "specialty": row.specialty}
            for row in db.query(Course).order_by(Course.specialty, Course.title).all()
        ],
        "academic_months": available_months(db),
        "date_range": {
            "min": min(date_values).isoformat() if date_values else None,
            "max": max(date_values).isoformat() if date_values else None,
        },
    }


@router.get("/dashboard")
def dashboard(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    academic_month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    specialty: str | None = Query(default=None),
    module_id: int | None = Query(default=None),
    class_name: str | None = Query(default=None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {
        "filters": filter_payload(start_date, end_date, academic_month, specialty, module_id, class_name),
        "summary": dashboard_summary_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        ),
        "trends": trend_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        ),
        "specialties": specialty_breakdown_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        ),
        "module_attendance": module_analysis_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        ),
        "module_popularity": module_popularity_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        ),
        "risk_students": risk_students(
            db, *effective_dates(start_date, end_date, academic_month),
            specialty, module_id, class_name
        ),
    }


@router.get("/analytics")
def analytics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    academic_month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    specialty: str | None = Query(default=None),
    module_id: int | None = Query(default=None),
    class_name: str | None = Query(default=None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return {
        "filters": filter_payload(start_date, end_date, academic_month, specialty, module_id, class_name),
        "specialty_comparison": specialty_breakdown_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        ),
        "module_attendance": module_analysis_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        ),
        "revenue_performance": trend_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        )["revenue"],
        "enrollment_evolution": trend_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        )["enrollments"],
        "risk_students": risk_students(
            db, *effective_dates(start_date, end_date, academic_month),
            specialty, module_id, class_name
        ),
        "ai": ai_data(
            db, start_date, end_date, academic_month, specialty, module_id, class_name
        ),
    }


# Compatibility endpoints retained for existing components.
@router.get("/students-count")
def students_count(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"students": db.query(Student).count()}


@router.get("/revenue")
def revenue(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"revenue": float(db.query(func.sum(Payment.amount)).scalar() or 0)}


@router.get("/enrollments-count")
def enrollments_count(user=Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(func.count(distinct(Enrollment.student_id))).scalar() or 0
    return {"enrollments": count}


@router.get("/students-per-course")
def students_per_course(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        {"course": item["module"], "students": item["students"]}
        for item in module_popularity_data(db)
    ]


@router.get("/attendance-rate")
def attendance_rate(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"attendance_rate": dashboard_summary_data(db)["attendance_rate"]}


@router.get("/absences")
def absences(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"absences": dashboard_summary_data(db)["absences"]}


@router.get("/revenue/monthly")
def monthly_revenue(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return trend_data(db)["revenue"]


@router.get("/students-growth")
def students_growth(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        {"month": row["month"], "new_students": row["enrollments"]}
        for row in trend_data(db)["enrollments"]
    ]


@router.get("/attendance-summary")
def attendance_summary(user=Depends(get_current_user), db: Session = Depends(get_db)):
    summary = dashboard_summary_data(db)
    return {"present": summary["present"], "absent": summary["absences"]}


@router.get("/recent-payments")
def recent_payments(user=Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(Payment.id, Student.name, Payment.amount, Payment.date)
        .join(Student, Payment.student_id == Student.id)
        .order_by(Payment.date.desc(), Payment.id.desc())
        .limit(5)
        .all()
    )
    return [
        {
            "id": row.id,
            "student": row.name,
            "amount": float(row.amount),
            "date": str(row.date),
        }
        for row in rows
    ]


@router.get("/courses")
def courses(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return filters(user, db)["modules"]


@router.get("/trends")
def trends(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return trend_data(db)


@router.get("/course-popularity")
def course_popularity(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return [
        {
            "course_id": row["module_id"],
            "course": row["module"],
            "enrollments": row["students"],
        }
        for row in module_popularity_data(db)
    ]


@router.get("/repeated-absences")
def repeated_absences(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return risk_students(db)


@router.get("/payments/monthly-summary")
def monthly_payment_summary(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return trend_data(db)["revenue"]


@router.get("/ai-insights")
def ai_insights(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return ai_data(db)


def xlsx_report(report):
    summary = report["summary"]
    rows = []

    def add_row(values, style=3):
        rows.append((values, style))

    add_row(["Rapport du Tableau de Bord Racine"], 1)
    add_row([])
    add_row(["Filtres appliqués"], 2)
    for key, value in report["filters"].items():
        add_row([key.replace("_", " ").title(), value or "Tous"], 3)
    add_row([])
    add_row(["KPI", "Valeur"], 2)
    for label, value in [
        ("Stagiaires", summary["students"]),
        ("Recettes encaissées (MAD)", summary["revenue"]),
        ("Recettes attendues (MAD)", summary["expected_revenue"]),
        ("Taux de recouvrement (%)", summary["collection_rate"]),
        ("Taux de présence (%)", summary["attendance_rate"]),
        ("Absences", summary["absences"]),
        ("Inscriptions à la rentrée", summary["enrollments"]),
        ("Développement Informatique", summary["development_students"]),
        ("Financier Comptable", summary["finance_students"]),
        ("Stagiaires à risque", summary["students_at_risk"]),
    ]:
        add_row([label, value], 3)
    add_row([])
    add_row(["Filière", "Stagiaires", "Recettes", "Taux de présence", "Absences"], 2)
    for row in report["specialties"]:
        add_row(
            [row["specialty"], row["students"], row["revenue"], row["attendance_rate"], row["absences"]],
            3,
        )
    add_row([])
    add_row(["Mois", "Recettes", "Recettes attendues", "Versements payés", "Versements attendus"], 2)
    for row in report["trends"]["revenue"]:
        add_row(
            [
                row["month"],
                row["revenue"],
                row["expected_revenue"],
                row["paid_installments"],
                row["expected_installments"],
            ],
            3,
        )
    add_row([])
    add_row(["Module", "Filière", "Taux de présence", "Absences", "Séances"], 2)
    for row in report["module_attendance"]:
        add_row([row["module"], row["specialty"], row["attendance_rate"], row["absences"], row["records"]], 3)
    add_row([])
    add_row(["Module", "Filière", "Stagiaires inscrits"], 2)
    for row in report["module_popularity"]:
        add_row([row["module"], row["specialty"], row["students"]], 3)

    def cell_ref(row_index, column_index):
        letters = ""
        while column_index:
            column_index, remainder = divmod(column_index - 1, 26)
            letters = chr(65 + remainder) + letters
        return f"{letters}{row_index}"

    sheet_rows = []
    for row_index, (row, style) in enumerate(rows, start=1):
        cells = []
        for column_index, value in enumerate(row, start=1):
            ref = cell_ref(row_index, column_index)
            if isinstance(value, (int, float)):
                cells.append(f'<c r="{ref}" s="{style}"><v>{value}</v></c>')
            else:
                cells.append(
                    f'<c r="{ref}" s="{style}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>'
                )
        sheet_rows.append(f'<row r="{row_index}">{"".join(cells)}</row>')

    sheet = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<cols><col min="1" max="1" width="34" customWidth="1"/>'
        '<col min="2" max="5" width="22" customWidth="1"/></cols>'
        f'<sheetData>{"".join(sheet_rows)}</sheetData>'
        '<mergeCells count="1"><mergeCell ref="A1:E1"/></mergeCells>'
        '</worksheet>'
    )
    styles = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="3"><font><sz val="11"/></font><font><b/><sz val="16"/><color rgb="FFFFFFFF"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/></font></fonts>'
        '<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1D4ED8"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF334155"/></patternFill></fill></fills>'
        '<borders count="2"><border/><border><left style="thin"><color rgb="FFD9E2EC"/></left><right style="thin"><color rgb="FFD9E2EC"/></right><top style="thin"><color rgb="FFD9E2EC"/></top><bottom style="thin"><color rgb="FFD9E2EC"/></bottom></border></borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"/></cellXfs>'
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        '</styleSheet>'
    )
    output = BytesIO()
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
        archive.writestr("_rels/.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
        archive.writestr("xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Racine Report" sheetId="1" r:id="rId1"/></sheets></workbook>')
        archive.writestr("xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
        archive.writestr("xl/styles.xml", styles)
        archive.writestr("xl/worksheets/sheet1.xml", sheet)
    return output.getvalue()


def logo_image_object():
    logo_path = Path(__file__).resolve().parents[1] / "assets" / "racine-logo.png"
    if not logo_path.exists():
        return None
    image = Image.open(logo_path).convert("RGBA")
    background = Image.new("RGBA", image.size, (255, 255, 255, 255))
    background.alpha_composite(image)
    image = background.convert("RGB")
    width, height = image.size
    compressed = zlib.compress(image.tobytes())
    stream = (
        f"<< /Type /XObject /Subtype /Image /Width {width} /Height {height} "
        f"/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode "
        f"/Length {len(compressed)} >>\nstream\n"
    ).encode("ascii") + compressed + b"\nendstream"
    return {"width": width, "height": height, "stream": stream}


def pdf_report(report):
    summary = report["summary"]
    logo = logo_image_object()
    pages = []

    def text_value(value):
        replacements = {
            "Ã©": "é", "Ã¨": "è", "Ãª": "ê", "Ã ": "à", "Ã§": "ç",
            "Ã‰": "É", "Ã´": "ô", "Ã®": "î",
            "ﾃｩ": "é", "ﾃｨ": "è", "ﾃｪ": "ê", "ﾃ": "à", "ﾃｧ": "ç",
            "ﾃ益": "É", "窶兮": "'", "窶冰": "'", "�": "e", "Ø": "é",
        }
        value = str(value)
        for bad, good in replacements.items():
            value = value.replace(bad, good)
        return value.encode("cp1252", errors="replace").decode("cp1252")

    def pdf_escape(value):
        value = text_value(value)
        return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

    def new_page():
        commands = ["0 0 0 rg 1 w"]
        if logo:
            logo_width = 42
            logo_height = round(logo_width * logo["height"] / logo["width"], 2)
            commands.append(f"q {logo_width} 0 0 {logo_height} 42 762 cm /ImLogo Do Q")
        commands.append("BT /F2 16 Tf 96 798 Td (Rapport du Tableau de Bord Racine) Tj ET")
        commands.append(
            "BT /F1 10 Tf 96 780 Td ("
            + pdf_escape("Synthèse filtrée des KPI, recettes, présences et modules")
            + ") Tj ET"
        )
        commands.append(
            f"BT /F1 8 Tf 430 800 Td ({pdf_escape('Généré le')} {date.today().isoformat()}) Tj ET"
        )
        pages.append(commands)
        return commands, 735

    commands, y = new_page()

    def add_text(x, y_pos, value, font="F1", size=9):
        commands.append(f"BT /{font} {size} Tf {x} {y_pos} Td ({pdf_escape(value)}) Tj ET")

    def add_line(x1, y1, x2, y2):
        commands.append(f"{x1} {y1} m {x2} {y2} l S")

    def add_rect(x, y_pos, width, height, fill=False):
        commands.append(f"{x} {y_pos} {width} {height} re {'f' if fill else 'S'}")

    def money(value):
        return f"{float(value or 0):,.0f}".replace(",", " ") + " MAD"

    def number(value):
        if isinstance(value, float):
            return f"{value:,.2f}".replace(",", " ").replace(".", ",").rstrip("0").rstrip(",")
        return f"{int(value or 0):,}".replace(",", " ")

    def percent(value):
        return f"{number(float(value or 0))} %"

    def ensure_space(required_height):
        nonlocal commands, y
        if y - required_height < 55:
            commands, y = new_page()

    def section_title(title):
        nonlocal y
        ensure_space(30)
        add_text(40, y, title, "F2", 13)
        y -= 10

    def draw_table(columns, rows, widths, x=40, row_height=18, font_size=9):
        nonlocal y, commands
        total_width = sum(widths)

        def draw_header():
            nonlocal y
            y -= row_height
            commands.append("0.82 0.82 0.82 rg")
            add_rect(x, y, total_width, row_height, fill=True)
            commands.append("0 0 0 rg")
            current_x = x
            for index, column in enumerate(columns):
                add_text(current_x + 6, y + 5, column, "F2", font_size)
                current_x += widths[index]
            add_line(x, y, x + total_width, y)
            add_line(x, y + row_height, x + total_width, y + row_height)
            current_x = x
            for width in widths:
                add_line(current_x, y, current_x, y + row_height)
                current_x += width
            add_line(x + total_width, y, x + total_width, y + row_height)

        ensure_space(row_height * 2)
        draw_header()
        for row in rows:
            if y - row_height < 55:
                commands, y = new_page()
                draw_header()
            y -= row_height
            current_x = x
            for index, value in enumerate(row):
                add_text(current_x + 6, y + 5, value, "F1", font_size)
                current_x += widths[index]
            add_line(x, y, x + total_width, y)
            current_x = x
            for width in widths:
                add_line(current_x, y, current_x, y + row_height)
                current_x += width
            add_line(x + total_width, y, x + total_width, y + row_height)
        y -= 24

    section_title("Filtres appliqués")
    draw_table(
        ["Filtre", "Valeur"],
        [[key.replace("_", " ").title(), str(value or "Tous")] for key, value in report["filters"].items()],
        [170, 300],
        row_height=16,
        font_size=8,
    )

    section_title("Indicateurs clés (KPI)")
    draw_table(
        ["Indicateur", "Valeur"],
        [
            ["Stagiaires", number(summary["students"])],
            ["Recettes encaissées", money(summary["revenue"])],
            ["Recettes attendues", money(summary["expected_revenue"])],
            ["Taux de recouvrement", percent(summary["collection_rate"])],
            ["Taux de présence", percent(summary["attendance_rate"])],
            ["Absences", number(summary["absences"])],
            ["Inscriptions annuelles", number(summary["enrollments"])],
            ["Stagiaires à risque", number(summary["students_at_risk"])],
        ],
        [190, 140],
        x=140,
        row_height=18,
        font_size=9,
    )

    section_title("Répartition par filière")
    draw_table(
        ["Filière", "Stagiaires", "Recettes", "Présence", "Absences"],
        [
            [row["specialty"], number(row["students"]), money(row["revenue"]), percent(row["attendance_rate"]), number(row["absences"])]
            for row in report["specialties"]
        ],
        [160, 70, 120, 80, 70],
        row_height=17,
        font_size=8,
    )

    section_title("Évolution mensuelle des encaissements")
    draw_table(
        ["Mois", "Recettes", "Attendu"],
        [
            [row["month"], money(row["revenue"]), money(row["expected_revenue"])]
            for row in report["trends"]["revenue"]
        ],
        [110, 160, 160],
        row_height=16,
        font_size=8,
    )

    section_title("Modules avec le plus d'absences")
    draw_table(
        ["Module", "Filière", "Absences", "Présence"],
        [
            [row["module"][:30], row["specialty"][:24], number(row["absences"]), percent(row["attendance_rate"])]
            for row in report["module_attendance"]
        ],
        [170, 150, 70, 80],
        row_height=16,
        font_size=8,
    )

    section_title("Modules les plus suivis")
    draw_table(
        ["Module", "Filière", "Stagiaires"],
        [
            [row["module"][:34], row["specialty"][:24], number(row["students"])]
            for row in report["module_popularity"]
        ],
        [200, 170, 80],
        row_height=16,
        font_size=8,
    )

    content_streams = ["\n".join(page).encode("cp1252", errors="replace") for page in pages]
    page_count = len(content_streams)
    page_ids = list(range(3, 3 + page_count))
    content_ids = list(range(3 + page_count, 3 + page_count * 2))
    font_regular_id = 3 + page_count * 2
    font_bold_id = font_regular_id + 1
    logo_id = font_bold_id + 1 if logo else None

    image_resource = f" /XObject << /ImLogo {logo_id} 0 R >>" if logo else ""
    kids = " ".join(f"{page_id} 0 R" for page_id in page_ids)
    objects = [
        f"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj".encode("ascii"),
        f"2 0 obj << /Type /Pages /Kids [{kids}] /Count {page_count} >> endobj".encode("ascii"),
    ]
    for page_id, content_id in zip(page_ids, content_ids):
        objects.append(
            (
                f"{page_id} 0 obj << /Type /Page /Parent 2 0 R /Resources << "
                f"/Font << /F1 {font_regular_id} 0 R /F2 {font_bold_id} 0 R >>{image_resource} >> "
                f"/MediaBox [0 0 595 842] /Contents {content_id} 0 R >> endobj"
            ).encode("ascii")
        )
    for content_id, content in zip(content_ids, content_streams):
        objects.append(
            f"{content_id} 0 obj << /Length {len(content)} >> stream\n".encode("ascii")
            + content
            + b"\nendstream endobj"
        )
    objects.extend(
        [
            f"{font_regular_id} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> endobj".encode("ascii"),
            f"{font_bold_id} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> endobj".encode("ascii"),
        ]
    )
    if logo:
        objects.append(f"{logo_id} 0 obj ".encode("ascii") + logo["stream"] + b" endobj")

    pdf = b"%PDF-1.4\n"
    offsets = []
    for obj in objects:
        offsets.append(len(pdf))
        pdf += obj + b"\n"
    xref_offset = len(pdf)
    pdf += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode("ascii")
    pdf += b"".join(f"{offset:010d} 00000 n \n".encode("ascii") for offset in offsets)
    pdf += f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF".encode("ascii")
    return pdf


@router.get("/export/dashboard")
def export_dashboard(
    format: str = Query(default="pdf", pattern="^(pdf|xlsx)$"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    academic_month: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}$"),
    specialty: str | None = Query(default=None),
    module_id: int | None = Query(default=None),
    class_name: str | None = Query(default=None),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = dashboard(
        start_date, end_date, academic_month, specialty, module_id, class_name, user, db
    )
    if format == "xlsx":
        return Response(
            xlsx_report(report),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="racine-dashboard-report.xlsx"'},
        )
    return Response(
        pdf_report(report),
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="racine-dashboard-report.pdf"'},
    )
