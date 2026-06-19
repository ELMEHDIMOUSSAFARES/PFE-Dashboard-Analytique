from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from .schemas import ChangePasswordReq, CreateUserReq, LoginReq, UpdateProfileReq
from auth_utils import hash_password, verify_password, create_access_token, decode_token
from .dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user

@router.post("/register")
def register(
    data: CreateUserReq,
    db: Session = Depends(get_db),
    user=Depends(require_admin)
    ):
    existing = db.query(User).filter(User.email == data.email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        email=data.email,
        full_name=data.full_name,
        password_hash=hash_password(data.password),
        role=data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created"}

@router.post("/login")
def login(data: LoginReq, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "full_name": user.full_name
    })

    return {"access_token": token}

@router.get("/users")
def get_users(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active
        }
        for u in users
    ]


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user=Depends(require_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if target_user.email == current_user.get("sub"):
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )

    if target_user.role == "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Le dernier administrateur ne peut pas être supprimé"
            )

    db.delete(target_user)
    db.commit()

    return {"message": "Utilisateur supprimé avec succès"}


@router.get("/me")
def me(user=Depends(get_current_user)):
    return user


@router.patch("/profile")
def update_profile(
    data: UpdateProfileReq,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(User).filter(User.email == data.email, User.id != user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user.email = data.email
    user.full_name = data.full_name
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "full_name": user.full_name
    })

    return {"message": "Profile updated", "access_token": token}

@router.patch("/change-password")
def change_password(
    data: ChangePasswordReq,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    user.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated"}
