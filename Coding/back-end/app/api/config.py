from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import get_current_admin, get_session
from app.models import CauHinhHeThong, NhanVien
from app.schemas import ConfigUpdate

router = APIRouter(prefix="/config", tags=["config"])

@router.get("/", response_model=CauHinhHeThong)
def get_config(
    db: Session = Depends(get_session),
) -> Any:
    config = db.exec(select(CauHinhHeThong)).first()
    if not config:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")
    return config

@router.put("/", response_model=CauHinhHeThong)
def update_config(
    config_in: ConfigUpdate,
    db: Session = Depends(get_session),
    current_admin: NhanVien = Depends(get_current_admin),
) -> Any:
    config = db.exec(select(CauHinhHeThong)).first()
    if not config:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình")

    update_data = config_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(config, key, value)
    config.NgayCapNhat = datetime.utcnow()
    db.commit()
    db.refresh(config)

    with open("be-log.md", "a") as f:
        f.write(f"\n- **{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}**: PUT /api/config -> Cập nhật cấu hình hệ thống\n")
    return config
