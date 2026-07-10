import uuid
import math
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_current_staff, get_current_user, get_session
from app.models import (
    HopDongBooking,
    KhachHangGPLX,
    PhuongThucCocEnum,
    TrangThaiBookingEnum,
    TrangThaiGPLXEnum,
    TrangThaiThanhToanEnum,
    XeMay,
)
from app.schemas import BookingCreate

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("/", response_model=HopDongBooking)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_session),
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    thoi_gian_nhan = datetime.fromisoformat(
        booking_in.ThoiGianNhan.replace("Z", "+00:00")
    ).replace(tzinfo=None)
    thoi_gian_tra = datetime.fromisoformat(
        booking_in.ThoiGianTra.replace("Z", "+00:00")
    ).replace(tzinfo=None)

    if thoi_gian_nhan < datetime.utcnow():
        raise HTTPException(
            status_code=400, detail="Thời gian nhận xe không được nằm trong quá khứ"
        )

    if thoi_gian_nhan >= thoi_gian_tra:
        raise HTTPException(
            status_code=400, detail="Thời gian trả phải sau thời gian nhận"
        )

    # Validate GPLX status before booking
    if current_user.TrangThaiGPLX != TrangThaiGPLXEnum.Da_Xac_Thuc:
        gplx_msg = {
            "Khong_Dang_Ky": "Bạn chưa đăng ký GPLX. Vui lòng cập nhật hồ sơ GPLX để đặt xe.",
            "Da_Upload": "GPLX của bạn đang chờ Admin phê duyệt. Vui lòng đợi xác nhận.",
            "Tu_Choi": "GPLX của bạn đã bị từ chối. Vui lòng cập nhật lại ảnh GPLX hợp lệ.",
        }
        raise HTTPException(
            status_code=403,
            detail=gplx_msg.get(current_user.TrangThaiGPLX.value, "GPLX chưa được xác thực.")
        )

    # Anti Race-Condition: Lock the row of the specific motorbike for update
    stmt_xe = select(XeMay).where(XeMay.MaXe == booking_in.MaXe).with_for_update()
    xe = db.exec(stmt_xe).first()
    if not xe:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe máy")

    # Check permissions based on engine capacity
    if xe.NhomXe == "Nhom_A2_PKL" and current_user.NhomXeDuocThue != "Nhom_A2_PKL":
        raise HTTPException(
            status_code=403, detail="Yêu cầu bằng A2 cho xe phân khối lớn"
        )
    elif xe.NhomXe == "Nhom_A1" and current_user.NhomXeDuocThue == "Nhom_50cc_Dien":
        raise HTTPException(
            status_code=403, detail="Yêu cầu bằng A1 hoặc A2 cho xe này"
        )

    # Check overlaps again while row is locked
    active_statuses = [
        TrangThaiBookingEnum.Cho_Thanh_Toan_Coc,
        TrangThaiBookingEnum.Cho_Nhan_Xe,
        TrangThaiBookingEnum.Dang_Thue,
        TrangThaiBookingEnum.Yeu_Cau_Tra_Som,
        TrangThaiBookingEnum.Qua_Han,
        TrangThaiBookingEnum.Cho_Tra_Xe,
        TrangThaiBookingEnum.Dang_Quyet_Toan,
    ]
    overlap_stmt = select(HopDongBooking).where(
        HopDongBooking.MaXe == booking_in.MaXe,
        HopDongBooking.TrangThaiBooking.in_(active_statuses),
        HopDongBooking.ThoiGianNhan < thoi_gian_tra,
        HopDongBooking.ThoiGianTra > thoi_gian_nhan,
    )
    if db.exec(overlap_stmt).first():
        db.rollback()
        raise HTTPException(
            status_code=400, detail="Xe đã được đặt trong khoảng thời gian này"
        )

    # Calculate costs (rounding up to nearest day)
    so_ngay = math.ceil((thoi_gian_tra - thoi_gian_nhan).total_seconds() / 86400)
    if so_ngay < 1:
        so_ngay = 1

    tong_tien_thue = xe.DonGiaNgay * so_ngay
    tien_coc = tong_tien_thue * Decimal("0.3")  # 30% deposit

    ma_booking = f"BK{uuid.uuid4().hex[:6].upper()}"
    new_booking = HopDongBooking(
        MaBooking=ma_booking,
        MaKhachHang=current_user.MaKhachHang,
        MaXe=xe.MaXe,
        ThoiGianNhan=thoi_gian_nhan,
        ThoiGianTra=thoi_gian_tra,
        ThoiGianTraGoc=thoi_gian_tra,
        SoNgayThue=so_ngay,
        SoNgayThueGoc=so_ngay,
        TrangThaiBooking=TrangThaiBookingEnum.Cho_Thanh_Toan_Coc,
        DonGiaApDung=xe.DonGiaNgay,
        TongTienThue=tong_tien_thue,
        TienCoc=tien_coc,
        PhuongThucCoc=PhuongThucCocEnum(booking_in.PhuongThucCoc),
        TrangThaiThanhToanCoc=TrangThaiThanhToanEnum.PENDING,
        TongThanhToan=tong_tien_thue,
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/bookings -> Khách {current_user.MaKhachHang} đặt xe {xe.BienSo} thành công, mã {ma_booking}\n"
        )
    return new_booking


@router.post("/{ma_booking}/payment/webhook")
def payment_webhook(
    ma_booking: str,
    transaction_id: str,
    status: str,
    db: Session = Depends(get_session),
) -> Any:
    # Mocking a payment gateway webhook
    booking = db.get(HopDongBooking, ma_booking)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if status.upper() == "SUCCESS":
        booking.TrangThaiThanhToanCoc = TrangThaiThanhToanEnum.SUCCESS
        booking.TrangThaiBooking = TrangThaiBookingEnum.Cho_Nhan_Xe
        booking.MaGiaoDichCoc = transaction_id
        db.commit()

        with open("be-log.md", "a") as f:
            f.write(
                f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: WEBHOOK /api/bookings/{ma_booking}/payment -> Thanh toán cọc thành công\n"
            )
        return {"message": "Payment successful"}
    else:
        booking.TrangThaiThanhToanCoc = TrangThaiThanhToanEnum.FAILED
        booking.TrangThaiBooking = TrangThaiBookingEnum.Da_Huy
        db.commit()
        return {"message": "Payment failed, booking cancelled"}


@router.post("/{ma_booking}/cancel")
def cancel_booking(
    ma_booking: str,
    db: Session = Depends(get_session),
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    booking = db.get(HopDongBooking, ma_booking)
    if not booking or booking.MaKhachHang != current_user.MaKhachHang:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.TrangThaiBooking not in [
        TrangThaiBookingEnum.Cho_Thanh_Toan_Coc,
        TrangThaiBookingEnum.Cho_Nhan_Xe,
    ]:
        raise HTTPException(
            status_code=400,
            detail="Chỉ có thể hủy đơn đang chờ nhận xe hoặc chờ thanh toán",
        )

    thoi_gian_truoc_nhan = booking.ThoiGianNhan - datetime.utcnow()
    hours_before = thoi_gian_truoc_nhan.total_seconds() / 3600

    # Refund logic
    refund_percent = 0
    if hours_before >= 24:
        refund_percent = 100
    elif 12 <= hours_before < 24:
        refund_percent = 50

    booking.TrangThaiBooking = TrangThaiBookingEnum.Da_Huy
    if (
        booking.TrangThaiThanhToanCoc == TrangThaiThanhToanEnum.SUCCESS
        and refund_percent > 0
    ):
        booking.TrangThaiThanhToanCoc = TrangThaiThanhToanEnum.REFUNDED
        # We would trigger actual refund API here

    db.commit()
    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/bookings/{ma_booking}/cancel -> Hủy đơn, tỷ lệ hoàn {refund_percent}%\n"
        )

    return {"message": f"Hủy thành công. Tỷ lệ hoàn cọc: {refund_percent}%"}


@router.post("/{ma_booking}/early-return")
def early_return_booking(
    ma_booking: str,
    thoi_gian_muon_tra: datetime,
    db: Session = Depends(get_session),
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    booking = db.get(HopDongBooking, ma_booking)
    if not booking or booking.MaKhachHang != current_user.MaKhachHang:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.TrangThaiBooking != TrangThaiBookingEnum.Dang_Thue:
        raise HTTPException(status_code=400, detail="Đơn không ở trạng thái Đang Thuê")

    # Check 1 hour before
    hours_notice = (
        thoi_gian_muon_tra.replace(tzinfo=None) - datetime.utcnow()
    ).total_seconds() / 3600
    if hours_notice < 1:
        raise HTTPException(status_code=400, detail="Phải báo trước tối thiểu 1 tiếng")

    booking.CoTraSom = True
    booking.ThoiGianYeuCauTraSom = thoi_gian_muon_tra
    booking.TrangThaiBooking = TrangThaiBookingEnum.Yeu_Cau_Tra_Som
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/bookings/{ma_booking}/early-return -> Yêu cầu trả xe sớm ghi nhận\n"
        )

    return {"message": "Ghi nhận yêu cầu trả sớm thành công"}


@router.post("/{ma_booking}/extend")
def extend_booking(
    ma_booking: str,
    so_ngay_gia_han: int,
    db: Session = Depends(get_session),
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    booking = db.get(HopDongBooking, ma_booking)
    if not booking or booking.MaKhachHang != current_user.MaKhachHang:
        raise HTTPException(status_code=404, detail="Booking not found")

    hours_left = (booking.ThoiGianTra - datetime.utcnow()).total_seconds() / 3600
    if hours_left < 2:
        raise HTTPException(
            status_code=400, detail="Phải yêu cầu gia hạn trước tối thiểu 2 tiếng"
        )

    if booking.SoLanGiaHan >= 3:
        raise HTTPException(status_code=400, detail="Vượt quá số lần gia hạn tối đa")

    # Anti Race-Condition: Lock the row of the specific motorbike for update
    stmt_xe = select(XeMay).where(XeMay.MaXe == booking.MaXe).with_for_update()
    _ = db.exec(stmt_xe).first()

    # Check overlaps for the extended period
    thoi_gian_tra_moi = booking.ThoiGianTra + timedelta(days=so_ngay_gia_han)
    active_statuses = [
        TrangThaiBookingEnum.Cho_Thanh_Toan_Coc,
        TrangThaiBookingEnum.Cho_Nhan_Xe,
        TrangThaiBookingEnum.Dang_Thue,
    ]
    overlap_stmt = select(HopDongBooking).where(
        HopDongBooking.MaXe == booking.MaXe,
        HopDongBooking.MaBooking != booking.MaBooking,
        HopDongBooking.TrangThaiBooking.in_(active_statuses),
        HopDongBooking.ThoiGianNhan < thoi_gian_tra_moi,
        HopDongBooking.ThoiGianTra > booking.ThoiGianTra,
    )
    if db.exec(overlap_stmt).first():
        raise HTTPException(
            status_code=400, detail="Xe đã có người đặt, không thể gia hạn"
        )

    # Calculate costs (ignoring holiday dynamics for simplicity, using base rate)
    chi_phi = booking.DonGiaApDung * so_ngay_gia_han

    booking.ThoiGianTra = thoi_gian_tra_moi
    booking.SoLanGiaHan += 1
    booking.TongTienGiaHan += chi_phi
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/bookings/{ma_booking}/extend -> Gia hạn thành công {so_ngay_gia_han} ngày\n"
        )

    return {"message": "Gia hạn thành công", "TongTienGiaHan": booking.TongTienGiaHan}




@router.get("/me", response_model=List[HopDongBooking])
def get_my_bookings(
    db: Session = Depends(get_session),
    current_user: KhachHangGPLX = Depends(get_current_user),
) -> Any:
    stmt = select(HopDongBooking).where(HopDongBooking.MaKhachHang == current_user.MaKhachHang)
    return db.exec(stmt).all()

@router.get("/all", response_model=List[HopDongBooking])
def get_all_bookings(
    db: Session = Depends(get_session),
    # Both Staff and Admin can view all bookings, but get_current_staff will allow Staff (and maybe Admin if we handle it)
    # Let's use get_current_staff which currently only checks for Staff or Admin role if we implement it.
    # We will assume anyone with a valid NhanVien token can access this.
    current_staff = Depends(get_current_staff),
) -> Any:
    return db.exec(select(HopDongBooking)).all()

@router.get("/{ma_booking}", response_model=HopDongBooking)
def get_booking(
    ma_booking: str,
    db: Session = Depends(get_session),
) -> Any:
    booking = db.get(HopDongBooking, ma_booking)
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn")
    return booking
