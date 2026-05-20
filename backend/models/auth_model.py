from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    name: str = Field(..., example="Ayushman Singh")
    email: EmailStr = Field(..., example="ayushman@example.com")
    password: str = Field(..., min_length=6, example="password123")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="ayushman@example.com")
    password: str = Field(..., example="password123")


class VerifyOtpRequest(BaseModel):
    email: EmailStr = Field(..., example="ayushman@example.com")
    otp: str = Field(..., example="123456")


class ResendOtpRequest(BaseModel):
    email: EmailStr = Field(..., example="ayushman@example.com")