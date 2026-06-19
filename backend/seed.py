from datetime import date, timedelta
import random
import re
import unicodedata

from sqlalchemy import text

from database import SessionLocal
from models import Attendance, Course, Enrollment, Payment, Student


RNG = random.Random(2026)
TUITION_AMOUNT = 1300.0

SPECIALTIES = {
    "Développement Informatique": {
        "classes": ["DI-1", "DI-2"],
        "modules": [
            "Algorithmique",
            "Programmation Python",
            "Développement Web",
            "Bases de Données",
            "Java",
            "JavaScript",
            "Réseaux Informatiques",
            "Génie Logiciel",
            "UML",
            "Systèmes d’Exploitation",
        ],
    },
    "Financier Comptable": {
        "classes": ["FC-1", "FC-2"],
        "modules": [
            "Comptabilité Générale",
            "Comptabilité Analytique",
            "Fiscalité",
            "Gestion Financière",
            "Mathématiques Financières",
            "Analyse Financière",
            "Gestion de Trésorerie",
            "Droit des Affaires",
            "Économie Générale",
            "Techniques Bancaires",
        ],
    },
}

FIRST_NAMES = [
    "Youssef", "Sara", "Mohamed", "Imane", "Hamza", "Salma", "Ayoub", "Oumaima",
    "Zakaria", "Khadija", "Amine", "Nadia", "Anas", "Meryem", "Mehdi", "Soukaina",
    "Omar", "Hajar", "Ismail", "Ghita", "Reda", "Ikram", "Bilal", "Asmae",
    "Abderrahmane", "Chaimae", "Ilyas", "Siham", "Adil", "Zineb", "Nabil", "Hanane",
    "Rachid", "Wiam", "Karim", "Aya", "Tarik", "Nisrine", "Hicham", "Lina",
]

LAST_NAMES = [
    "El Amrani", "Benali", "Ait Lahcen", "El Fassi", "Berrada", "Chraibi",
    "El Idrissi", "Tazi", "Alaoui", "Bennani", "Lahlou", "Mansouri", "Naciri",
    "Ouazzani", "Skalli", "Amrani", "Fikri", "Kadiri", "Zerouali", "Belkadi",
    "Tahiri", "El Gharbi", "Boussaid", "Mernissi", "Daoudi", "Sabri", "Haddad",
    "Cherkaoui", "Benkirane", "Rami", "Ait Ali", "Lamrani", "El Khatib",
    "Bouazza", "Jabri", "Kabbaj", "Mouline", "El Mansouri", "Bakkali", "Raji",
]

ACADEMIC_MONTHS = [
    (2025, 9), (2025, 10), (2025, 11), (2025, 12), (2026, 1),
    (2026, 2), (2026, 3), (2026, 4), (2026, 5), (2026, 6),
]

MODULE_ABSENCE_RISK = {
    "Réseaux Informatiques": 0.16,
    "Systèmes d’Exploitation": 0.14,
    "Comptabilité Analytique": 0.15,
    "Fiscalité": 0.14,
    "Mathématiques Financières": 0.16,
}


def slug(value):
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", ".", ascii_value.lower()).strip(".")


def month_dates(year, month):
    current = date(year, month, 1)
    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)
    dates = []
    while current < next_month:
        if current.weekday() < 5:
            dates.append(current)
        current += timedelta(days=1)
    return dates


def build_students():
    names = [
        f"{first} {last}"
        for first, last in zip(FIRST_NAMES + FIRST_NAMES, LAST_NAMES + list(reversed(LAST_NAMES)))
    ]
    students = []
    name_index = 0
    for specialty, config in SPECIALTIES.items():
        for class_name in config["classes"]:
            for _ in range(20):
                name = names[name_index]
                name_index += 1
                students.append(
                    Student(
                        name=name,
                        email=f"{slug(name)}{name_index:02d}@racine.com",
                        specialty=specialty,
                        class_name=class_name,
                    )
                )
    return students


def seed():
    db = SessionLocal()
    try:
        # Existing databases may predate these two fields.
        db.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS specialty VARCHAR"))
        db.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS class_name VARCHAR"))
        db.execute(text("ALTER TABLE courses ADD COLUMN IF NOT EXISTS specialty VARCHAR"))
        db.commit()

        # Users are intentionally untouched.
        db.query(Attendance).delete()
        db.query(Payment).delete()
        db.query(Enrollment).delete()
        db.query(Course).delete()
        db.query(Student).delete()
        db.commit()

        courses = []
        for specialty, config in SPECIALTIES.items():
            courses.extend(
                Course(title=module, specialty=specialty)
                for module in config["modules"]
            )
        db.add_all(courses)
        db.flush()

        students = build_students()
        db.add_all(students)
        db.flush()

        courses_by_specialty = {
            specialty: [
                course for course in courses if course.specialty == specialty
            ]
            for specialty in SPECIALTIES
        }

        enrollments = []
        payments = []
        attendance = []

        for student_index, student in enumerate(students):
            student_courses = courses_by_specialty[student.specialty]
            personal_absence_bias = 0.12 if student_index % 17 == 0 else 0

            for course in student_courses:
                enrollments.append(
                    Enrollment(
                        student_id=student.id,
                        course_id=course.id,
                        date=date(2025, 9, 1 + (student_index % 12)),
                    )
                )

            payment_profile = student_index % 10
            if payment_profile <= 5:
                payment_probability = 0.88
            elif payment_profile <= 7:
                payment_probability = 0.62
            else:
                payment_probability = 0.38

            outstanding_months = 0
            for month_index, (year, month) in enumerate(ACADEMIC_MONTHS):
                outstanding_months += 1
                should_pay = RNG.random() < payment_probability
                if outstanding_months >= 4:
                    should_pay = RNG.random() < 0.9

                if should_pay:
                    payment_day = 3 + ((student_index + month_index) % 18)
                    payments.append(
                        Payment(
                            student_id=student.id,
                            amount=TUITION_AMOUNT * outstanding_months,
                            date=date(year, month, payment_day),
                        )
                    )
                    outstanding_months = 0

            # July is a catch-up month for delayed tuition. Some balances remain
            # unpaid intentionally so collection and risk indicators are realistic.
            if outstanding_months and RNG.random() < 0.72:
                payments.append(
                    Payment(
                        student_id=student.id,
                        amount=TUITION_AMOUNT * outstanding_months,
                        date=date(2026, 7, 5 + (student_index % 15)),
                    )
                )

            attendance_months = ACADEMIC_MONTHS + [(2026, 7)]
            for month_index, (year, month) in enumerate(attendance_months):
                weekdays = month_dates(year, month)
                session_days = weekdays[::5][:4]
                for session_index, session_date in enumerate(session_days):
                    module_index = (month_index * 2 + session_index) % len(student_courses)
                    course = student_courses[module_index]
                    base_risk = MODULE_ABSENCE_RISK.get(course.title, 0.07)
                    if student.class_name in {"DI-2", "FC-2"}:
                        base_risk += 0.015
                    absent = RNG.random() < min(base_risk + personal_absence_bias, 0.38)
                    attendance.append(
                        Attendance(
                            student_id=student.id,
                            course_id=course.id,
                            status="absent" if absent else "present",
                            date=session_date,
                        )
                    )

        db.add_all(enrollments)
        db.add_all(payments)
        db.add_all(attendance)
        db.commit()

        print(
            "Racine data seeded: "
            f"{len(students)} students, {len(courses)} modules, "
            f"{len(enrollments)} enrollments, {len(payments)} payments, "
            f"{len(attendance)} attendance records. Users were not modified."
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
