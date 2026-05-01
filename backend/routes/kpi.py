from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import SessionLocal
from models import Student, Payment, Enrollment, Course, Attendance
from auth.dependencies import get_current_user

router = APIRouter(prefix="/kpi", tags=["kpi"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/students-count")
def students_count(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Student).count()
    return {"students": count}


@router.get("/revenue")
def revenue(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(func.sum(Payment.amount)).scalar()
    return {"revenue": total or 0}

@router.get("/enrollments-count")
def enrollments_count(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Enrollment).count()
    return {"enrollments": count}


@router.get("/students-per-course")
def students_per_course(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(
        Course.title,
        func.count(Enrollment.id)
    ).join(Enrollment, Course.id == Enrollment.course_id)\
     .group_by(Course.title).all()

    return [
        {"course": r[0], "students": r[1]}
        for r in results
    ]

@router.get("/attendance-rate")
def attendance_rate(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(Attendance).count()

    present = db.query(Attendance)\
        .filter(Attendance.status == "present")\
        .count()

    rate = (present / total * 100) if total > 0 else 0

    return {"attendance_rate": round(rate, 2)}

@router.get("/absences")
def absences(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Attendance)\
        .filter(Attendance.status == "absent")\
        .count()

    return {"absences": count}


@router.get("/revenue/monthly")
def monthly_revenue(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    month_col = func.date_trunc('month', Payment.date)

    results = db.query(
        month_col.label("month"),
        func.sum(Payment.amount)
    ).group_by(month_col)\
     .order_by(month_col)\
     .all()

    return [
        {"month": str(r[0]), "revenue": r[1]}
        for r in results
    ]


@router.get("/students-growth")
def students_growth(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    month_col = func.date_trunc('month', Enrollment.date)

    results = db.query(
        month_col.label("month"),
        func.count(Enrollment.id)
    ).group_by(month_col)\
     .order_by(month_col)\
     .all()

    return [
        {"month": str(r[0]), "new_students": r[1]}
        for r in results
    ]