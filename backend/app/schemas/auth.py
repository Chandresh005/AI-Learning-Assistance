from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120, description="Full name of the learner")
    email: str = Field(..., min_length=3, max_length=255, description="Email address")
    password: str = Field(..., min_length=4, max_length=128, description="Account password")


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Email address")
    password: str = Field(..., description="Account password")


class DemoLoginRequest(BaseModel):
    role: str = Field(default="student", description="Demo role: 'student' or 'instructor'")


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
