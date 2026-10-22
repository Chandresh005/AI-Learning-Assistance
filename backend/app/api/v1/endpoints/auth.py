import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    DemoLoginRequest,
    UserResponse,
    AuthTokenResponse,
)

router = APIRouter()
security = HTTPBearer(auto_error=False)
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    salt = settings.SECRET_KEY.encode("utf-8")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return digest.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    expected = hash_password(plain_password)
    return hmac.compare_digest(expected, hashed_password)


def create_access_token(user: User) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "exp": expire,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


async def ensure_demo_users(db: AsyncSession) -> None:
    demo_accounts = [
        {
            "name": "Alex Rivera",
            "email": "alex.rivera@stanford.edu",
            "password": "demo1234",
        },
        {
            "name": "Prof. Nitish Singh (CampusX)",
            "email": "instructor@campusx.in",
            "password": "demo1234",
        },
    ]
    for acct in demo_accounts:
        stmt = select(User).where(User.email == acct["email"])
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if not existing:
            db.add(
                User(
                    name=acct["name"],
                    email=acct["email"],
                    password_hash=hash_password(acct["password"]),
                )
            )
    await db.commit()


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    email_normalized = payload.email.strip().lower()
    stmt = select(User).where(User.email == email_normalized)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user = User(
        name=payload.name.strip(),
        email=email_normalized,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user)
    return AuthTokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthTokenResponse)
async def login_user(payload: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    await ensure_demo_users(db)

    email_normalized = payload.email.strip().lower()
    stmt = select(User).where(User.email == email_normalized)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Try the demo credentials or create a new account.",
        )

    token = create_access_token(user)
    return AuthTokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/demo", response_model=AuthTokenResponse)
async def demo_login(payload: DemoLoginRequest, db: AsyncSession = Depends(get_db)):
    await ensure_demo_users(db)

    target_email = (
        "instructor@campusx.in"
        if payload.role.lower() == "instructor"
        else "alex.rivera@stanford.edu"
    )
    stmt = select(User).where(User.email == target_email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Demo user could not be initialized.")

    token = create_access_token(user)
    return AuthTokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserResponse.model_validate(user)
