from sqlmodel import Session, select
from app.database import engine
from app.models import KhachHangGPLX, TrangThaiGPLXEnum
from app.api.users import approve_gplx, reject_gplx, blacklist_user, unblacklist_user
import traceback

def test():
    with Session(engine) as db:
        # 1. Ensure we have a user in Da_Upload state
        user = db.exec(select(KhachHangGPLX).limit(1)).first()
        if not user:
            print("No users found to test")
            return
            
        print(f"Testing on User: {user.MaKhachHang}, current GPLX status: {user.TrangThaiGPLX}")
        # Force status to Da_Upload for testing approve
        user.TrangThaiGPLX = TrangThaiGPLXEnum.Da_Upload
        db.add(user)
        db.commit()
        
        print("\n--- Testing approve_gplx ---")
        try:
            approve_gplx(ma_kh=user.MaKhachHang, db=db, current_admin=None)
            print("Approve OK")
        except Exception as e:
            print("Approve failed:")
            traceback.print_exc()

if __name__ == "__main__":
    test()
