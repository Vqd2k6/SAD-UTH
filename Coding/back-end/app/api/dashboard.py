from datetime import datetime, timedelta
from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_session
from app.models import HopDongBooking, NhanVien, TrangThaiXeEnum, TrangThaiBookingEnum, XeMay, BaoDuong

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/statistics", response_model=Dict[str, Any])
def get_statistics(
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    completed_statuses = [TrangThaiBookingEnum.Dang_Quyet_Toan, TrangThaiBookingEnum.Hoan_Tat, TrangThaiBookingEnum.Khong_Den_Nhan_Xe]
    now = datetime.utcnow()
    week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # Total revenue
    stmt_revenue = select(func.sum(HopDongBooking.TongThanhToan)).where(
        HopDongBooking.TrangThaiBooking.in_(completed_statuses)
    )
    total_revenue = db.exec(stmt_revenue).first() or 0

    # Revenue this week
    stmt_week = select(func.sum(HopDongBooking.TongThanhToan)).where(
        HopDongBooking.TrangThaiBooking.in_(completed_statuses),
        HopDongBooking.NgayCapNhat >= week_start,
    )
    revenue_week = db.exec(stmt_week).first() or 0

    # Revenue this month
    stmt_month = select(func.sum(HopDongBooking.TongThanhToan)).where(
        HopDongBooking.TrangThaiBooking.in_(completed_statuses),
        HopDongBooking.NgayCapNhat >= month_start,
    )
    revenue_month = db.exec(stmt_month).first() or 0

    # Bookings this week
    stmt_bookings_week = select(func.count(HopDongBooking.MaBooking)).where(
        HopDongBooking.NgayTao >= week_start,
    )
    bookings_week = db.exec(stmt_bookings_week).first() or 0

    # Bookings this month
    stmt_bookings_month = select(func.count(HopDongBooking.MaBooking)).where(
        HopDongBooking.NgayTao >= month_start,
    )
    bookings_month = db.exec(stmt_bookings_month).first() or 0

    # Motorbike status counts
    total_bikes = db.exec(select(func.count(XeMay.MaXe))).first() or 0
    active_rentals = db.exec(select(func.count(HopDongBooking.MaBooking)).where(
        HopDongBooking.TrangThaiBooking == TrangThaiBookingEnum.Dang_Thue
    )).first() or 0

    maintenance_bikes = db.exec(select(func.count(XeMay.MaXe)).where(
        XeMay.TrangThaiXe == TrangThaiXeEnum.Dang_Bao_Duong
    )).first() or 0

    # Maintenance cost
    stmt_maintenance = select(func.sum(BaoDuong.ChiPhi))
    total_maintenance_cost = db.exec(stmt_maintenance).first() or 0
    
    # Net revenue
    net_revenue = total_revenue - total_maintenance_cost

    # Recent bookings
    stmt_recent_bookings = select(HopDongBooking).order_by(HopDongBooking.NgayTao.desc()).limit(10)
    recent_bookings = db.exec(stmt_recent_bookings).all()

    return {
        "total_revenue": total_revenue,
        "total_maintenance_cost": total_maintenance_cost,
        "net_revenue": net_revenue,
        "revenue_week": revenue_week,
        "revenue_month": revenue_month,
        "bookings_week": bookings_week,
        "bookings_month": bookings_month,
        "total_motorbikes": total_bikes,
        "active_rentals": active_rentals,
        "motorbikes_in_maintenance": maintenance_bikes,
        "available_motorbikes": total_bikes - active_rentals - maintenance_bikes,
        "recent_bookings": recent_bookings,
    }
