from sqlmodel import Session, create_engine

from app.core.config import settings

# Create the DB Engine
engine = create_engine(settings.DATABASE_URL, echo=True)


# Dependency to get a database session
def get_session():
    with Session(engine) as session:
        yield session
