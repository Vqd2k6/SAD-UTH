from sqlalchemy import text
from app.database import engine

def fix():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE \"Hop_Dong_Booking\" ADD COLUMN \"TrangThaiThanhToanCoc\" VARCHAR(50) DEFAULT 'PENDING'"))
            print("Successfully added TrangThaiThanhToanCoc to Hop_Dong_Booking")
        except Exception as e:
            print("Error or column already exists:", e)

if __name__ == "__main__":
    fix()
