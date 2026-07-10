from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_session
from app.models import HopDongBooking, NhanVien, TrangThaiXeEnum, TrangThaiBookingEnum, XeMay

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/statistics", response_model=Dict[str, Any])
def get_statistics(
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    # Revenue (TongThanhToan from completed bookings)
    stmt_revenue = select(func.sum(HopDongBooking.TongThanhToan)).where(
        HopDongBooking.TrangThaiBooking.in_([TrangThaiBookingEnum.Dang_Quyet_Toan, TrangThaiBookingEnum.Hoan_Tat])
    )
    total_revenue = db.exec(stmt_revenue).first() or 0

    # Motorbike status counts
    total_bikes = db.exec(select(func.count(XeMay.MaXe))).first() or 0
    active_rentals = db.exec(select(func.count(HopDongBooking.MaBooking)).where(
        HopDongBooking.TrangThaiBooking == "Dang_Thue"
    )).first() or 0

    maintenance_bikes = db.exec(select(func.count(XeMay.MaXe)).where(
        XeMay.TrangThaiXe == TrangThaiXeEnum.Dang_Bao_Duong
    )).first() or 0

    return {
        "total_revenue": total_revenue,
        "total_motorbikes": total_bikes,
        "active_rentals": active_rentals,
        "motorbikes_in_maintenance": maintenance_bikes,
        "available_motorbikes": total_bikes - active_rentals - maintenance_bikes
    }
