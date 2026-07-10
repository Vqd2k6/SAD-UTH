from app.database import engine
from sqlalchemy import text
def test():
    with engine.begin() as conn:
        res = conn.execute(text("SELECT enumlabel FROM pg_enum WHERE enumtypid = 'trangthaigplxenum'::regtype;"))
        for row in res:
            print(row[0])
test()
