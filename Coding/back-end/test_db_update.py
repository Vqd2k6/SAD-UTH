from sqlmodel import Session, select
from app.database import engine
from app.models import XeMay
from app.api.motorbikes import update_motorbike
from app.schemas import MotorbikeUpdate
from fastapi import HTTPException

def test():
    with Session(engine) as db:
        # Use an existing bike
        bike = db.exec(select(XeMay).limit(1)).first()
        if not bike:
            print("No bike found")
            return
            
        print("Updating bike:", bike.MaXe)
        update_data = MotorbikeUpdate(DonGiaNgay=200000)
        
        try:
            update_motorbike(ma_xe=bike.MaXe, xe_in=update_data, db=db, current_admin=None)
            print("Updated successfully")
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    test()
