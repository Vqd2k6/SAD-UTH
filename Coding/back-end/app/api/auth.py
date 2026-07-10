import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.api.deps import get_session
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import (
    HangGPLXEnum,
    KhachHangGPLX,
    LuaChonGPLXEnum,
    NhanVien,
    NhomXeEnum,
    TrangThaiGPLXEnum,
    VaiTroEnum,
)
from app.schemas import Token, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=KhachHangGPLX)
def register(user_in: UserRegister, db: Session = Depends(get_session)) -> Any:
    # Check duplicate email or phone
    stmt = select(KhachHangGPLX).where(
        (KhachHangGPLX.Email == user_in.Email)
        | (KhachHangGPLX.SoDienThoai == user_in.SoDienThoai)
    )
    if db.exec(stmt).first():
        raise HTTPException(
            status_code=400,
            detail="Tài khoản với Email hoặc Số điện thoại này đã tồn tại",
        )

    # Process GPLX Logic (Auto-assign role)
    luachon = LuaChonGPLXEnum.Khong_GPLX
    trangthai = TrangThaiGPLXEnum.Khong_Dang_Ky
    nhomxe = NhomXeEnum.Nhom_50cc_Dien
    hang_enum = None

    if user_in.AnhGPLXMatTruoc or user_in.AnhGPLXMatSau:
        luachon = LuaChonGPLXEnum.Co_GPLX
        trangthai = TrangThaiGPLXEnum.Da_Upload

        if user_in.HangGPLXKhaiBao == "A2":
            hang_enum = HangGPLXEnum.A2
            nhomxe = NhomXeEnum.Nhom_A2_PKL
        elif user_in.HangGPLXKhaiBao == "A1":
            hang_enum = HangGPLXEnum.A1
            nhomxe = NhomXeEnum.Nhom_A1
        else:
            hang_enum = HangGPLXEnum.Khong

    if len(user_in.MatKhau) > 72:
        raise HTTPException(status_code=400, detail="Mật khẩu không được vượt quá 72 ký tự")

    new_user = KhachHangGPLX(
        MaKhachHang=f"KH{uuid.uuid4().hex[:6].upper()}",
        HoTen=user_in.HoTen,
        Email=user_in.Email,
        SoDienThoai=user_in.SoDienThoai,
        MatKhau=get_password_hash(user_in.MatKhau),
        CCCD=user_in.CCCD,
        LuaChonGPLX=luachon,
        HangGPLX=hang_enum,
        AnhGPLXMatTruoc=user_in.AnhGPLXMatTruoc,
        AnhGPLXMatSau=user_in.AnhGPLXMatSau,
        TrangThaiGPLX=trangthai,
        NhomXeDuocThue=nhomxe,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log it
    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{new_user.NgayTao.strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/auth/register -> Tạo KH mới {new_user.MaKhachHang}\n"
        )

    return new_user


@router.post("/login/customer", response_model=Token)
def login_customer(
    db: Session = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    # Username is used as email/phone
    stmt = select(KhachHangGPLX).where(
        (KhachHangGPLX.Email == form_data.username)
        | (KhachHangGPLX.SoDienThoai == form_data.username)
    )
    user = db.exec(stmt).first()
    if not user or not verify_password(form_data.password, user.MatKhau):
        raise HTTPException(status_code=400, detail="Sai thông tin đăng nhập")
    if user.TrangThaiBlacklist:
        raise HTTPException(status_code=400, detail="Tài khoản đang bị khóa")

    return {
        "access_token": create_access_token(subject=user.MaKhachHang),
        "token_type": "bearer",
    }


@router.post("/login/staff", response_model=Token)
def login_staff(
    db: Session = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    stmt = select(NhanVien).where(
        (NhanVien.Email == form_data.username)
        | (NhanVien.SoDienThoai == form_data.username)
    )
    user = db.exec(stmt).first()
    if not user or not verify_password(form_data.password, user.MatKhau):
        raise HTTPException(status_code=400, detail="Sai thông tin đăng nhập")
    if user.TrangThaiTaiKhoan != "Hoat_Dong":
        raise HTTPException(status_code=400, detail="Tài khoản nhân viên đang bị khóa")
    if user.VaiTro != VaiTroEnum.Nhan_Vien:
        raise HTTPException(status_code=403, detail="Tài khoản không có quyền truy cập cổng Nhân Viên")

    return {
        "access_token": create_access_token(subject=user.MaNhanVien),
        "token_type": "bearer",
    }


@router.post("/login/admin", response_model=Token)
def login_admin(
    db: Session = Depends(get_session),
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    stmt = select(NhanVien).where(
        (NhanVien.Email == form_data.username)
        | (NhanVien.SoDienThoai == form_data.username)
    )
    user = db.exec(stmt).first()
    if not user or not verify_password(form_data.password, user.MatKhau):
        raise HTTPException(status_code=400, detail="Sai thông tin đăng nhập")
    if user.TrangThaiTaiKhoan != "Hoat_Dong":
        raise HTTPException(status_code=400, detail="Tài khoản quản trị đang bị khóa")
    if user.VaiTro != VaiTroEnum.Admin:
        raise HTTPException(status_code=403, detail="Tài khoản không có quyền truy cập cổng Quản Trị (Admin)")

    return {
        "access_token": create_access_token(subject=user.MaNhanVien),
        "token_type": "bearer",
    }
