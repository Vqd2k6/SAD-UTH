from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_current_user, get_session, get_current_staff
from app.models import (
    HangGPLXEnum,
    KhachHangGPLX,
    LuaChonGPLXEnum,
    NhanVien,
    NhomXeEnum,
    TrangThaiGPLXEnum,
)
from app.schemas import UserGPLXUpdate, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=KhachHangGPLX)
def read_user_me(
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    return current_user



@router.put("/me", response_model=KhachHangGPLX)
def update_user_me(
    user_in: UserUpdate,
    db: Session = Depends(get_session),
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    update_data = user_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)

    current_user.NgayCapNhat = datetime.utcnow()
    db.commit()
    db.refresh(current_user)

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/users/me -> Cập nhật thông tin cá nhân cho KH {current_user.MaKhachHang}\n")
    return current_user

@router.put("/me/gplx", response_model=KhachHangGPLX)
def update_user_gplx(
    gplx_in: UserGPLXUpdate,
    db: Session = Depends(get_session),
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    current_user.LuaChonGPLX = LuaChonGPLXEnum.Co_GPLX
    current_user.TrangThaiGPLX = TrangThaiGPLXEnum.Da_Upload
    current_user.HangGPLX = HangGPLXEnum(gplx_in.HangGPLXKhaiBao)
    current_user.SoGPLX = gplx_in.SoGPLX
    current_user.AnhGPLXMatTruoc = gplx_in.AnhGPLXMatTruoc
    current_user.AnhGPLXMatSau = gplx_in.AnhGPLXMatSau

    if current_user.HangGPLX == HangGPLXEnum.A2:
        current_user.NhomXeDuocThue = NhomXeEnum.Nhom_A2_PKL
    else:
        current_user.NhomXeDuocThue = NhomXeEnum.Nhom_A1

    current_user.NgayCapNhat = datetime.utcnow()
    db.commit()
    db.refresh(current_user)

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/users/me/gplx -> Cập nhật GPLX cho {current_user.MaKhachHang}\n")
    return current_user

@router.get("/", response_model=List[KhachHangGPLX])
def list_users(
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_staff),
) -> Any:
    return db.exec(select(KhachHangGPLX)).all()

@router.put("/{ma_kh}/blacklist")
def blacklist_user(
    ma_kh: str,
    ly_do: str,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    user = db.get(KhachHangGPLX, ma_kh)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")

    user.TrangThaiBlacklist = True
    user.LyDoBlacklist = ly_do
    user.NgayCapNhat = datetime.utcnow()
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/users/{ma_kh}/blacklist -> Đánh dấu Blacklist KH {ma_kh}\n")
    return {"message": "Đã đánh dấu Blacklist", "user": user}


@router.delete("/{ma_kh}/blacklist")
def unblacklist_user(
    ma_kh: str,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    user = db.get(KhachHangGPLX, ma_kh)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")

    user.TrangThaiBlacklist = False
    user.LyDoBlacklist = None
    user.NgayCapNhat = datetime.utcnow()
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: DELETE /api/users/{ma_kh}/blacklist -> Gỡ Blacklist KH {ma_kh}\n")
    return {"message": "Đã gỡ Blacklist"}


@router.put("/{ma_kh}/gplx/approve")
def approve_gplx(
    ma_kh: str,
    db: Session = Depends(get_session),
    current_staff: NhanVien = Depends(get_current_staff),
) -> Any:
    """Admin/Staff phê duyệt bằng lái xe của khách hàng."""
    user = db.get(KhachHangGPLX, ma_kh)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")

    if user.TrangThaiGPLX != TrangThaiGPLXEnum.Da_Upload:
        raise HTTPException(status_code=400, detail="GPLX chưa được upload hoặc đã được xử lý")

    user.TrangThaiGPLX = TrangThaiGPLXEnum.Da_Xac_Thuc
    user.NgayCapNhat = datetime.utcnow()
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/users/{ma_kh}/gplx/approve -> Nhân viên/Admin phê duyệt GPLX\n")
    return {"message": "Đã phê duyệt GPLX thành công", "TrangThaiGPLX": "Da_Xac_Thuc"}


@router.put("/{ma_kh}/gplx/reject")
def reject_gplx(
    ma_kh: str,
    ly_do: str = "Bằng lái không hợp lệ",
    db: Session = Depends(get_session),
    current_staff: NhanVien = Depends(get_current_staff),
) -> Any:
    """Admin/Staff từ chối bằng lái xe của khách hàng."""
    user = db.get(KhachHangGPLX, ma_kh)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách hàng")

    user.TrangThaiGPLX = TrangThaiGPLXEnum.Tu_Choi
    user.NgayCapNhat = datetime.utcnow()
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/users/{ma_kh}/gplx/reject -> Admin từ chối GPLX. Lý do: {ly_do}\n")
    return {"message": f"Đã từ chối GPLX. Lý do: {ly_do}"}

