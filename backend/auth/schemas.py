from pydantic import BaseModel, EmailStr
from typing import Literal

class CreateUserReq(BaseModel):
  email: EmailStr
  full_name: str
  password: str
  role: Literal["admin", "personnel"]


class SetupReq(BaseModel):
  email: EmailStr
  full_name: str
  password: str


class LoginReq(BaseModel):
  email: EmailStr
  password: str


class ChangePasswordReq(BaseModel):
  old_password: str
  new_password: str


class UpdateProfileReq(BaseModel):
  email: EmailStr
  full_name: str
