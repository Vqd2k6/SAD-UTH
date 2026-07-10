from sqlalchemy import text
from app.database import engine

def fix():
    # PostgreSQL requires ALTER TYPE ... ADD VALUE to be executed outside a transaction block
    with engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        try:
            conn.execute(text("ALTER TYPE trangthaigplxenum ADD VALUE 'Da_Xac_Thuc'"))
            print("Added Da_Xac_Thuc")
        except Exception as e:
            print("Already exists or error:", e)
        try:
            conn.execute(text("ALTER TYPE trangthaigplxenum ADD VALUE 'Tu_Choi'"))
            print("Added Tu_Choi")
        except Exception as e:
            print("Already exists or error:", e)

if __name__ == "__main__":
    fix()
