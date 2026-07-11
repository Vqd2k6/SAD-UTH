import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_current_staff, get_only_staff, get_session
from app.core.security import get_password_hash
from app.models import (
    HopDongBooking,
    LichSuThue,
    MucXangEnum,
    NhanVien,
    TrangThaiBookingEnum,
    TrangThaiTaiKhoanEnum,
    TrangThaiXeEnum,
    VaiTroEnum,
    XeMay,
    KhachHangGPLX
)
from app.schemas import CheckInSchema, CheckOutSchema, StaffCreate, StaffUpdate

router = APIRouter(prefix="/staff/bookings", tags=["staff"])


@router.post("/{ma_booking}/check-in")
def booking_check_in(
    ma_booking: str,
    check_in_data: CheckInSchema,
    db: Session = Depends(get_session),
    current_staff: NhanVien = Depends(get_only_staff),
) -> Any:
    booking = db.get(HopDongBooking, ma_booking)
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn")

    if booking.TrangThaiBooking != TrangThaiBookingEnum.Cho_Nhan_Xe:
        raise HTTPException(
            status_code=400, detail="Đơn không ở trạng thái Chờ Nhận Xe"
        )

    # --- Time Window Validation ---
    now = datetime.utcnow()
    diff_seconds = (booking.ThoiGianNhan - now).total_seconds()
    diff_hours = diff_seconds / 3600
    if diff_hours > 2:
        raise HTTPException(
            status_code=400,
            detail=f"Chưa đến giờ nhận xe. Chỉ được check-in sớm tối đa 2 tiếng. Còn {diff_hours:.1f} tiếng nữa mới tới giờ."
        )
    if diff_hours < -24:
        raise HTTPException(
            status_code=400,
            detail="Đã quá 24 tiếng kể từ giờ hẹn nhận xe. Đơn này đã hết hiệu lực check-in."
        )

    # Handle GPLX fraud
    xe = db.get(XeMay, booking.MaXe)
    if check_in_data.KhachGianLanGPLX:
        user = db.get(KhachHangGPLX, booking.MaKhachHang)
        if user:
            user.TrangThaiBlacklist = True
            user.LyDoBlacklist = "Gian lận GPLX tại cửa hàng"
        
        xe.TrangThaiXe = TrangThaiXeEnum.San_Sang
        booking.TrangThaiBooking = TrangThaiBookingEnum.Khong_Den_Nhan_Xe
        booking.GhiChu = "Nhân viên phát hiện gian lận GPLX lúc Check-in. Xử lý như No-show (Phạt 100% cọc)."
        booking.TongThanhToan = booking.TienCoc # Tịch thu cọc làm doanh thu
        
        # Tạo lịch sử thuê vi phạm
        import uuid
        ma_lich_su = f"LS{uuid.uuid4().hex[:6].upper()}"
        lich_su = LichSuThue(
            MaLichSu=ma_lich_su,
            MaBooking=booking.MaBooking,
            MaKhachHang=booking.MaKhachHang,
            MaXe=xe.MaXe,
            BienSoXe=xe.BienSo,
            ThoiGianNhan=booking.ThoiGianNhan,
            ThoiGianTra=datetime.utcnow(),
            TongTienThanhToan=booking.TienCoc,
            DanhDauViPham=True,
            GhiChuNoiBo="Gian lận GPLX"
        )
        db.add(lich_su)
        db.commit()
        
        with open("be-log.md", "a") as f:
            f.write(
                f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/staff/bookings/{ma_booking}/check-in -> KH gian lận GPLX, blacklist KH, giải phóng xe, phạt 100% cọc\n"
            )
        return {"message": "Đã hủy đơn do gian lận GPLX, blacklist khách hàng, giải phóng xe, phạt 100% cọc"}

    # Proceed with check-in
    booking.ODONhan = check_in_data.ODONhan
    booking.MucXangNhan = MucXangEnum(check_in_data.MucXangNhan)
    booking.AnhNgoaiQuanNhan = check_in_data.AnhNgoaiQuanNhan
    booking.SoMuBaoHiemGiao = check_in_data.SoMuBaoHiemGiao
    booking.CoAoMuaGiao = check_in_data.CoAoMuaGiao
    booking.MaNhanVienGiao = current_staff.MaNhanVien
    booking.TrangThaiBooking = TrangThaiBookingEnum.Dang_Thue

    xe.TrangThaiXe = TrangThaiXeEnum.Dang_Thue
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/staff/bookings/{ma_booking}/check-in -> Check-in thành công\n"
        )

    return {"message": "Check-in thành công, xe đã được giao"}


@router.post("/{ma_booking}/check-out")
def booking_check_out(
    ma_booking: str,
    check_out_data: CheckOutSchema,
    db: Session = Depends(get_session),
    current_staff: NhanVien = Depends(get_only_staff),
) -> Any:
    booking = db.get(HopDongBooking, ma_booking)
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn")

    if booking.TrangThaiBooking not in [
        TrangThaiBookingEnum.Dang_Thue,
        TrangThaiBookingEnum.Yeu_Cau_Tra_Som,
        TrangThaiBookingEnum.Qua_Han,
    ]:
        raise HTTPException(
            status_code=400, detail="Không thể check-out đơn ở trạng thái này"
        )

    xe = db.get(XeMay, booking.MaXe)

    if booking.ODONhan is not None and check_out_data.ODOTra < booking.ODONhan:
        raise HTTPException(
            status_code=400, detail=f"ODO trả ({check_out_data.ODOTra}) không thể nhỏ hơn ODO nhận ({booking.ODONhan})"
        )

    # Late fee calculation
    thoi_gian_tre = datetime.utcnow() - booking.ThoiGianTra
    hours_late = thoi_gian_tre.total_seconds() / 3600
    phi_phat_tre_han = Decimal(0)

    if hours_late > 2:
        if 2 < hours_late <= 6:
            rate = (
                Decimal("30000")
                if xe.LoaiXe in ["Xe_So", "Xe_Ga"]
                else Decimal("50000")
            )
            phi_phat_tre_han = rate * Decimal(str(int(hours_late)))
            if phi_phat_tre_han > (booking.DonGiaApDung / 2):
                phi_phat_tre_han = booking.DonGiaApDung / 2
        elif 6 < hours_late <= 12:
            phi_phat_tre_han = booking.DonGiaApDung / 2
        else:
            phi_phat_tre_han = booking.DonGiaApDung

    # Accessories fee calculation
    phi_mat_phu_kien = Decimal(0)
    so_mu_mat = booking.SoMuBaoHiemGiao - check_out_data.SoMuBaoHiemTra
    if so_mu_mat > 0:
        # Default helmet fee 150000
        phi_mat_phu_kien += Decimal(so_mu_mat * 150000)
    if booking.CoAoMuaGiao and not check_out_data.CoAoMuaTra:
        phi_mat_phu_kien += Decimal(50000)

    phi_den_bu_hu_hai = Decimal(check_out_data.PhiDenBuHuHai)

    tong_quyet_toan = (
        booking.TongTienThue
        + booking.TongTienGiaHan
        + phi_phat_tre_han
        + phi_mat_phu_kien
        + phi_den_bu_hu_hai
    )

    tong_thanh_toan = tong_quyet_toan - booking.TienCoc

    # Update Booking
    booking.ODOTra = check_out_data.ODOTra
    booking.MucXangTra = MucXangEnum(check_out_data.MucXangTra)
    booking.AnhNgoaiQuanTra = check_out_data.AnhNgoaiQuanTra
    booking.SoMuBaoHiemTra = check_out_data.SoMuBaoHiemTra
    booking.CoAoMuaTra = check_out_data.CoAoMuaTra
    booking.PhiDenBuHuHai = phi_den_bu_hu_hai
    booking.LyDoPhat = check_out_data.LyDoPhat
    booking.PhiPhatTreHan = phi_phat_tre_han
    booking.PhiMatPhuKien = phi_mat_phu_kien
    booking.TongThanhToan = tong_quyet_toan
    booking.ThoiGianTraThucTe = datetime.utcnow()
    booking.MaNhanVienNhan = current_staff.MaNhanVien
    booking.TrangThaiBooking = TrangThaiBookingEnum.Hoan_Tat

    # Update Bike
    xe.TrangThaiXe = TrangThaiXeEnum.San_Sang
    xe.ODOHienTai = check_out_data.ODOTra

    # Add History
    ma_lich_su = f"LS{uuid.uuid4().hex[:6].upper()}"
    lich_su = LichSuThue(
        MaLichSu=ma_lich_su,
        MaBooking=booking.MaBooking,
        MaKhachHang=booking.MaKhachHang,
        MaXe=xe.MaXe,
        BienSoXe=xe.BienSo,
        ThoiGianNhan=booking.ThoiGianNhan,
        ThoiGianTra=booking.ThoiGianTraThucTe,
        TongTienThanhToan=tong_quyet_toan,
    )
    db.add(lich_su)
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/staff/bookings/{ma_booking}/check-out -> Check-out hoàn tất. Tổng quyết toán: {tong_quyet_toan}, Còn phải thu/trả: {tong_thanh_toan}\n"
        )

    return {
        "message": "Check-out thành công",
        "TongTienThue": booking.TongTienThue,
        "TongTienGiaHan": booking.TongTienGiaHan,
        "PhiTreHan": phi_phat_tre_han,
        "PhiMatMu": Decimal(max(0, so_mu_mat) * 150000) if so_mu_mat > 0 else Decimal(0),
        "PhiMatAoMua": Decimal(50000) if (booking.CoAoMuaGiao and not check_out_data.CoAoMuaTra) else Decimal(0),
        "PhiDenBuHuHai": phi_den_bu_hu_hai,
        "TongQuyetToan": tong_quyet_toan,
        "TienCocDaDong": booking.TienCoc,
        "SoTienCanThuThemHoacHoanTra": tong_thanh_toan,
    }


from datetime import timedelta

@router.get("/worklist", response_model=List[HopDongBooking])
def get_worklist(
    time_filter: str = "today",
    db: Session = Depends(get_session),
    current_staff: NhanVien = Depends(get_current_staff),
) -> Any:
    """Danh sách các đơn cần giao xe hoặc cần nhận xe."""
    today_statuses = [
        TrangThaiBookingEnum.Cho_Nhan_Xe,
        TrangThaiBookingEnum.Dang_Thue,
        TrangThaiBookingEnum.Yeu_Cau_Tra_Som,
        TrangThaiBookingEnum.Qua_Han,
        TrangThaiBookingEnum.Cho_Tra_Xe,
    ]
    stmt = select(HopDongBooking).where(
        HopDongBooking.TrangThaiBooking.in_(today_statuses)
    )

    now = datetime.utcnow()
    if time_filter == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=1)
    elif time_filter == "week":
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=7)
    elif time_filter == "month":
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 12:
            end_date = start_date.replace(year=now.year + 1, month=1)
        else:
            end_date = start_date.replace(month=now.month + 1)
    else:
        start_date = None
        end_date = None

    if start_date and end_date:
        stmt = stmt.where(
            (
                (HopDongBooking.ThoiGianNhan >= start_date) & 
                (HopDongBooking.ThoiGianNhan < end_date)
            ) | (
                (HopDongBooking.ThoiGianTra >= start_date) & 
                (HopDongBooking.ThoiGianTra < end_date)
            )
        )

    stmt = stmt.order_by(HopDongBooking.ThoiGianNhan)
    bookings = db.exec(stmt).all()
    return bookings


staff_manage_router = APIRouter(prefix="/staff", tags=["staff_management"])

@staff_manage_router.get("/", response_model=List[NhanVien])
def list_staff(
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    stmt = select(NhanVien)
    return db.exec(stmt).all()

@staff_manage_router.get("/{ma_nv}", response_model=NhanVien)
def get_staff(
    ma_nv: str,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    nv = db.get(NhanVien, ma_nv)
    if not nv:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")
    return nv

@staff_manage_router.post("/", response_model=NhanVien)
def create_staff(
    staff_in: StaffCreate,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    stmt = select(NhanVien).where(
        (NhanVien.Email == staff_in.Email) | (NhanVien.SoDienThoai == staff_in.SoDienThoai)
    )
    if db.exec(stmt).first():
        raise HTTPException(status_code=400, detail="Email hoặc số điện thoại đã tồn tại")

    new_staff = NhanVien(
        MaNhanVien=f"NV{uuid.uuid4().hex[:5].upper()}",
        HoTen=staff_in.HoTen,
        Email=staff_in.Email,
        SoDienThoai=staff_in.SoDienThoai,
        VaiTro=VaiTroEnum(staff_in.VaiTro),
        MatKhau=get_password_hash(staff_in.MatKhau)
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/staff/ -> Tạo NV {new_staff.MaNhanVien}\n")
    return new_staff

@staff_manage_router.put("/{ma_nv}", response_model=NhanVien)
def update_staff(
    ma_nv: str,
    staff_in: StaffUpdate,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    nv = db.get(NhanVien, ma_nv)
    if not nv:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân viên")

    update_data = staff_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "VaiTro":
            setattr(nv, key, VaiTroEnum(value))
        elif key == "TrangThaiTaiKhoan":
            setattr(nv, key, TrangThaiTaiKhoanEnum(value))
        else:
            setattr(nv, key, value)

    db.commit()
    db.refresh(nv)

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/staff/{ma_nv} -> Cập nhật thông tin NV\n")
    return nv
