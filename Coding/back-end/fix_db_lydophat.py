from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE "Hop_Dong_Booking" ADD COLUMN "LyDoPhat" TEXT;'))
        conn.commit()
        print("Column LyDoPhat added successfully!")
    except Exception as e:
        print("Error adding column:", e)
