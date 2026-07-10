from typing import Generator

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError
from sqlmodel import Session

from app.core.config import settings
from app.database import engine
from app.models import KhachHangGPLX, NhanVien, VaiTroEnum

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def get_current_user(
    db: Session = Depends(get_session), token: str = Depends(reusable_oauth2)
) -> KhachHangGPLX:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = payload.get("sub")
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = db.get(KhachHangGPLX, token_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.TrangThaiBlacklist:
        raise HTTPException(status_code=400, detail="Inactive user (Blacklisted)")
    return user


def get_current_staff(
    db: Session = Depends(get_session), token: str = Depends(reusable_oauth2)
) -> NhanVien:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = payload.get("sub")
    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = db.get(NhanVien, token_data)
    if not user:
        raise HTTPException(status_code=404, detail="Staff not found")
    if user.TrangThaiTaiKhoan != "Hoat_Dong":
        raise HTTPException(status_code=400, detail="Inactive staff")
    return user

def get_only_staff(
    current_staff: NhanVien = Depends(get_current_staff),
) -> NhanVien:
    if current_staff.VaiTro != VaiTroEnum.Nhan_Vien:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges (Staff only)"
        )
    return current_staff


def get_current_admin(
    current_staff: NhanVien = Depends(get_current_staff),
) -> NhanVien:
    if current_staff.VaiTro != VaiTroEnum.Admin:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_staff
