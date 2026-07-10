import uuid
from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_current_user, get_session
from app.models import DanhGia, HopDongBooking, KhachHangGPLX, TrangThaiBookingEnum
from app.schemas import DanhGiaCreate

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.post("/", response_model=DanhGia)
def create_rating(
    rating_in: DanhGiaCreate,
    db: Session = Depends(get_session),
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    # Check if booking exists and belongs to user
    booking = db.get(HopDongBooking, rating_in.MaBooking)
    if not booking or booking.MaKhachHang != current_user.MaKhachHang:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn đặt xe")

    # Only allow rating if booking is completed
    if booking.TrangThaiBooking != TrangThaiBookingEnum.Hoan_Tat:
        raise HTTPException(status_code=400, detail="Chỉ có thể đánh giá khi chuyến đi đã hoàn thành")

    # Check if already rated
    existing_rating = db.exec(select(DanhGia).where(DanhGia.MaBooking == rating_in.MaBooking)).first()
    if existing_rating:
        raise HTTPException(status_code=400, detail="Bạn đã đánh giá chuyến đi này rồi")

    rating = DanhGia(
        MaDanhGia=f"DG{uuid.uuid4().hex[:6].upper()}",
        MaBooking=rating_in.MaBooking,
        DiemDanhGia=rating_in.DiemDanhGia,
        NoiDung=rating_in.NoiDung,
        NgayTao=datetime.utcnow()
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/ratings/ -> Khách hàng {current_user.MaKhachHang} đánh giá booking {rating_in.MaBooking}\n")

    return rating

@router.get("/motorbike/{ma_xe}", response_model=List[DanhGia])
def get_motorbike_ratings(
    ma_xe: str,
    db: Session = Depends(get_session)
) -> Any:
    stmt = select(DanhGia).join(HopDongBooking).where(HopDongBooking.MaXe == ma_xe)
    return db.exec(stmt).all()
