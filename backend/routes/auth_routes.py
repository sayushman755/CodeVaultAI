import random
import os
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from models.auth_model import UserSignup, UserLogin, VerifyOtpRequest, ResendOtpRequest
from database import users_collection
from services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", 10))


def user_serializer(user) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "is_verified": user.get("is_verified", False),
        "created_at": user.get("created_at")
    }


def generate_otp():
    return str(random.randint(100000, 999999))


def get_otp_expiry():
    return datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)


@router.post("/signup")
def signup(user: UserSignup):
    existing_user = users_collection.find_one({"email": user.email.lower()})

    if existing_user and existing_user.get("is_verified") is True:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists. Please login."
        )

    otp = generate_otp()
    otp_expiry = get_otp_expiry()

    if existing_user and existing_user.get("is_verified") is False:
        users_collection.update_one(
            {"email": user.email.lower()},
            {
                "$set": {
                    "name": user.name,
                    "password": hash_password(user.password),
                    "otp": otp,
                    "otp_expiry": otp_expiry,
                    "updated_at": datetime.now().isoformat()
                }
            }
        )

        return {
            "message": "OTP generated successfully. Use this OTP for testing.",
            "email": user.email.lower(),
            "test_otp": otp
        }

    user_data = {
        "name": user.name,
        "email": user.email.lower(),
        "password": hash_password(user.password),
        "is_verified": False,
        "otp": otp,
        "otp_expiry": otp_expiry,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    users_collection.insert_one(user_data)

    return {
        "message": "Signup successful. OTP generated successfully. Verify before login.",
        "email": user.email.lower(),
        "test_otp": otp
    }


@router.post("/verify-otp")
def verify_otp(request: VerifyOtpRequest):
    user = users_collection.find_one({"email": request.email.lower()})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("is_verified") is True:
        return {
            "message": "Account already verified. Please login."
        }

    stored_otp = user.get("otp")
    otp_expiry = user.get("otp_expiry")

    if not stored_otp or not otp_expiry:
        raise HTTPException(
            status_code=400,
            detail="OTP not found. Please resend OTP."
        )

    if datetime.utcnow() > otp_expiry:
        raise HTTPException(
            status_code=400,
            detail="OTP expired. Please resend OTP."
        )

    if request.otp != stored_otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    users_collection.update_one(
        {"email": request.email.lower()},
        {
            "$set": {
                "is_verified": True,
                "updated_at": datetime.now().isoformat()
            },
            "$unset": {
                "otp": "",
                "otp_expiry": ""
            }
        }
    )

    return {
        "message": "Email verified successfully. You can now login."
    }


@router.post("/resend-otp")
def resend_otp(request: ResendOtpRequest):
    user = users_collection.find_one({"email": request.email.lower()})

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("is_verified") is True:
        raise HTTPException(
            status_code=400,
            detail="Account already verified. Please login."
        )

    otp = generate_otp()
    otp_expiry = get_otp_expiry()

    users_collection.update_one(
        {"email": request.email.lower()},
        {
            "$set": {
                "otp": otp,
                "otp_expiry": otp_expiry,
                "updated_at": datetime.now().isoformat()
            }
        }
    )

    return {
        "message": "OTP regenerated successfully. Use this OTP for testing.",
        "email": request.email.lower(),
        "test_otp": otp
    }


@router.post("/login")
def login(user: UserLogin):
    existing_user = users_collection.find_one({"email": user.email.lower()})

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if existing_user.get("is_verified") is not True:
        raise HTTPException(
            status_code=403,
            detail="Please verify your account with OTP before login."
        )

    password_valid = verify_password(user.password, existing_user["password"])

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "user_id": str(existing_user["_id"]),
        "email": existing_user["email"]
    })

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": user_serializer(existing_user)
    }