from pydantic import BaseModel, EmailStr

class CreateUserReq(BaseModel):
  email: EmailStr
  password: str
  role: str


class LoginReq(BaseModel):
  email: EmailStr
  password: str