from datetime import datetime
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_session
from app.models import (
    HopDongBooking,
    LoaiXeEnum,
    NhanVien,
    NhomXeEnum,
    TrangThaiBookingEnum,
    TrangThaiXeEnum,
    XeMay,
)
from app.schemas import MotorbikeCreate, MotorbikeUpdate

router = APIRouter(prefix="/motorbikes", tags=["motorbikes"])


@router.get("/search", response_model=List[XeMay])
def search_motorbikes(
    thoi_gian_nhan: datetime,
    thoi_gian_tra: datetime,
    loai_xe: Optional[str] = None,
    phan_khoi_min: Optional[int] = None,
    db: Session = Depends(get_session),
) -> Any:
    # Build query for XeMay
    stmt = (
        select(XeMay)
        .where(XeMay.TrangThaiXe != "Dang_Bao_Duong")
        .where(XeMay.TrangThaiXe != "Dang_Sua_Chua")
    )

    if loai_xe:
        stmt = stmt.where(XeMay.LoaiXe == loai_xe)
    if phan_khoi_min:
        stmt = stmt.where(XeMay.PhanKhoi >= phan_khoi_min)

    all_bikes = db.exec(stmt).all()

    # Get all active bookings overlapping with the requested time
    # Overlap logic: (B.Nhan < A.Tra) AND (B.Tra > A.Nhan)
    # A = requested time, B = booking time
    active_statuses = [
        TrangThaiBookingEnum.Cho_Thanh_Toan_Coc,
        TrangThaiBookingEnum.Cho_Nhan_Xe,
        TrangThaiBookingEnum.Dang_Thue,
        TrangThaiBookingEnum.Yeu_Cau_Tra_Som,
        TrangThaiBookingEnum.Qua_Han,
        TrangThaiBookingEnum.Cho_Tra_Xe,
        TrangThaiBookingEnum.Dang_Quyet_Toan,
    ]

    overlap_stmt = select(HopDongBooking.MaXe).where(
        HopDongBooking.TrangThaiBooking.in_(active_statuses),
        HopDongBooking.ThoiGianNhan < thoi_gian_tra,
        HopDongBooking.ThoiGianTra > thoi_gian_nhan,
    )
    booked_bike_ids = db.exec(overlap_stmt).all()

    # Filter out booked bikes
    available_bikes = [bike for bike in all_bikes if bike.MaXe not in booked_bike_ids]

    return available_bikes


@router.post("/", response_model=XeMay)
def create_motorbike(
    xe_in: MotorbikeCreate,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    existing = db.exec(select(XeMay).where(XeMay.BienSo == xe_in.BienSo)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Biển số {xe_in.BienSo} đã tồn tại")

    xe_may = XeMay(
        MaXe=xe_in.MaXe,
        BienSo=xe_in.BienSo,
        SoKhung=xe_in.SoKhung,
        SoMay=xe_in.SoMay,
        HangXe=xe_in.HangXe,
        TenXe=xe_in.TenXe,
        LoaiXe=LoaiXeEnum(xe_in.LoaiXe),
        PhanKhoi=xe_in.PhanKhoi,
        NhomXe=NhomXeEnum(xe_in.NhomXe),
        DoiXe=xe_in.DoiXe,
        HinhAnhXe=xe_in.HinhAnhXe,
        TrangThaiXe=TrangThaiXeEnum(xe_in.TrangThaiXe),
        MucTieuThuXang=xe_in.MucTieuThuXang,
        SoMuBaoHiem=xe_in.SoMuBaoHiem,
        CoAoMua=xe_in.CoAoMua,
        DonGiaNgay=xe_in.DonGiaNgay,
        ODOHienTai=xe_in.ODOHienTai,
    )
    db.add(xe_may)
    db.commit()
    db.refresh(xe_may)

    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/motorbikes -> Admin thêm xe mới {xe_may.BienSo}\n"
        )

    return xe_may


@router.post("/upload-image", response_model=dict)
def upload_motorbike_image(
    file: UploadFile = File(...),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    """Upload ảnh xe máy, trả về chuỗi base64 để lưu vào HinhAnhXe."""
    import base64
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File phải là ảnh (jpg, png, webp...)")
    content = file.file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="Ảnh không được vượt quá 5MB")
    b64 = base64.b64encode(content).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{b64}"
    return {"image_data": data_url}


@router.delete("/{ma_xe}")
def delete_motorbike(
    ma_xe: str,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    xe_may = db.get(XeMay, ma_xe)
    if not xe_may:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe")

    # Check if there are active bookings
    active_statuses = [
        TrangThaiBookingEnum.Cho_Thanh_Toan_Coc,
        TrangThaiBookingEnum.Cho_Nhan_Xe,
        TrangThaiBookingEnum.Dang_Thue,
        TrangThaiBookingEnum.Yeu_Cau_Tra_Som,
        TrangThaiBookingEnum.Qua_Han,
        TrangThaiBookingEnum.Cho_Tra_Xe,
        TrangThaiBookingEnum.Dang_Quyet_Toan,
    ]
    stmt = select(HopDongBooking).where(
        HopDongBooking.MaXe == ma_xe,
        HopDongBooking.TrangThaiBooking.in_(active_statuses),
    )
    active_bookings = db.exec(stmt).all()
    if active_bookings:
        raise HTTPException(
            status_code=400, detail="Không thể xóa xe đang có hợp đồng hoạt động"
        )

    db.delete(xe_may)
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(
            f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: DELETE /api/motorbikes/{ma_xe} -> Admin xóa xe {xe_may.BienSo}\n"
        )

    return {"message": "Xóa thành công"}



@router.get("/all", response_model=List[XeMay])
def get_all_motorbikes(
    db: Session = Depends(get_session),
) -> Any:
    return db.exec(select(XeMay)).all()

@router.get("/{ma_xe}", response_model=XeMay)
def get_motorbike(
    ma_xe: str,
    db: Session = Depends(get_session),
) -> Any:
    xe = db.get(XeMay, ma_xe)
    if not xe:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe máy")
    return xe

@router.put("/{ma_xe}", response_model=XeMay)
def update_motorbike(
    ma_xe: str,
    xe_in: MotorbikeUpdate,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    xe = db.get(XeMay, ma_xe)
    if not xe:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe máy")

    # Check if there are active bookings before updating sensitive fields
    active_statuses = [
        TrangThaiBookingEnum.Cho_Thanh_Toan_Coc,
        TrangThaiBookingEnum.Cho_Nhan_Xe,
        TrangThaiBookingEnum.Dang_Thue,
        TrangThaiBookingEnum.Yeu_Cau_Tra_Som,
        TrangThaiBookingEnum.Qua_Han,
        TrangThaiBookingEnum.Cho_Tra_Xe,
        TrangThaiBookingEnum.Dang_Quyet_Toan,
    ]
    stmt = select(HopDongBooking).where(
        HopDongBooking.MaXe == ma_xe,
        HopDongBooking.TrangThaiBooking.in_(active_statuses),
    )
    active_bookings = db.exec(stmt).all()
    if active_bookings:
        # Prevent changing fields that affect the rental or the rental process
        update_data = xe_in.model_dump(exclude_unset=True)
        restricted_keys = ["TrangThaiXe", "LoaiXe", "PhanKhoi", "NhomXe", "DonGiaNgay"]
        for key in restricted_keys:
            if key in update_data:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Không thể thay đổi {key} khi xe đang có hợp đồng hoạt động"
                )

    update_data = xe_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "TrangThaiXe":
            setattr(xe, key, TrangThaiXeEnum(value))
        else:
            setattr(xe, key, value)

    xe.NgayCapNhat = datetime.utcnow()
    db.commit()
    db.refresh(xe)

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/motorbikes/{ma_xe} -> Cập nhật thông tin xe\n")
    return xe
