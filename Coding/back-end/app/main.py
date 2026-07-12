from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlmodel import SQLModel

import app.models  # Import to register models
from app.api.router import router as api_router
from app.core.logger import api_logging_middleware, log_system_event
from app.database import engine


def create_db_and_tables():
    # Only create if they don't exist
    SQLModel.metadata.create_all(engine)
    log_system_event(
        event_type="DB",
        target="All Tables",
        method="CREATE_ALL",
        output_data="Tables created via SQLModel",
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo DB khi app bắt đầu chạy
    create_db_and_tables()
    yield
    # Cleanup nếu cần


import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hệ thống thuê xe máy API", lifespan=lifespan)

# Setup CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thêm logging middleware
app.middleware("http")(api_logging_middleware)

# Đăng ký router
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Welcome to Motorcycle Rental System API"}
