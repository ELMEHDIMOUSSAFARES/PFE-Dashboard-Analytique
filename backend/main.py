import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from auth.router import router as auth_router
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth_utils import decode_token
from fastapi import Depends, HTTPException


app = FastAPI()
models.Base.metadata.create_all(bind=engine)
app.include_router(auth_router)


origins = [
  "http://localhost:5173"
]

def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return payload

@app.get("/test")
def test(user=Depends(get_current_user)):
    return {
        "message": "JWT works",
        "user": user
    }