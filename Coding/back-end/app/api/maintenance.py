import uuid
from datetime import datetime
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_current_staff, get_session
from app.models import BaoDuong, NhanVien, XeMay, TrangThaiXeEnum
from app.schemas import BaoDuongCreate

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.post("/", response_model=BaoDuong)
def create_maintenance_record(
    record_in: BaoDuongCreate,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_staff),
) -> Any:
    xe = db.get(XeMay, record_in.MaXe)
    if not xe:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe máy")
    
    if xe.TrangThaiXe != TrangThaiXeEnum.San_Sang:
        raise HTTPException(
            status_code=400, 
            detail="Chỉ có thể bảo dưỡng xe đang ở trạng thái Sẵn Sàng"
        )
    
    xe.TrangThaiXe = TrangThaiXeEnum.Dang_Bao_Duong

    ngay_bao_duong = datetime.fromisoformat(record_in.NgayBaoDuong.replace("Z", "+00:00")).replace(tzinfo=None)

    record = BaoDuong(
        MaBaoDuong=f"BD{uuid.uuid4().hex[:6].upper()}",
        MaXe=record_in.MaXe,
        NgayBaoDuong=ngay_bao_duong,
        ChiPhi=record_in.ChiPhi,
        ChiTietBaoDuong=record_in.ChiTietBaoDuong
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: POST /api/maintenance/ -> Admin lưu lịch bảo dưỡng xe {record_in.MaXe}\n")

    return record

@router.get("/all", response_model=List[BaoDuong])
def get_all_maintenance(
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_staff),
) -> Any:
    return db.exec(select(BaoDuong)).all()

@router.put("/{ma_bao_duong}/complete")
def complete_maintenance(
    ma_bao_duong: str,
    db: Session = Depends(get_session),
    current_staff: NhanVien = Depends(get_current_staff),
) -> Any:
    """Hoàn thành bảo dưỡng, đưa xe về trạng thái Sẵn Sàng."""
    record = db.get(BaoDuong, ma_bao_duong)
    if not record:
        raise HTTPException(status_code=404, detail="Không tìm thấy bản ghi bảo dưỡng")

    xe = db.get(XeMay, record.MaXe)
    if not xe:
        raise HTTPException(status_code=404, detail="Không tìm thấy xe máy tương ứng")

    if record.DaHoanThanh:
        return {"message": f"Xe {xe.BienSo} đã hoàn tất bảo dưỡng từ trước!", "MaXe": xe.MaXe}

    record.DaHoanThanh = True
    if xe.TrangThaiXe == TrangThaiXeEnum.Dang_Bao_Duong:
        xe.TrangThaiXe = TrangThaiXeEnum.San_Sang
    xe.NgayCapNhat = datetime.utcnow()
    db.commit()

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/maintenance/{ma_bao_duong}/complete -> Xe {xe.BienSo} hoàn tất bảo dưỡng, trả về Sẵn Sàng\n")

    return {"message": f"Xe {xe.BienSo} đã hoàn tất bảo dưỡng và trở về trạng thái Sẵn Sàng!", "MaXe": xe.MaXe}

@router.get("/motorbike/{ma_xe}", response_model=List[BaoDuong])
def get_motorbike_maintenance(
    ma_xe: str,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    stmt = select(BaoDuong).where(BaoDuong.MaXe == ma_xe)
    return db.exec(stmt).all()
