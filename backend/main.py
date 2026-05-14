import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from auth.router import router as auth_router
from routes.kpi import router as kpi_router


app = FastAPI()
models.Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(kpi_router)


origins = [
  "http://localhost:5173"
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)
