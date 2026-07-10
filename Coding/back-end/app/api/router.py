from fastapi import APIRouter

from app.api import (
    auth,
    bookings,
    config,
    dashboard,
    maintenance,
    motorbikes,
    ratings,
    staff,
    users,
)

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running"}


router.include_router(auth.router)
router.include_router(users.router)
router.include_router(motorbikes.router)
router.include_router(bookings.router)
router.include_router(staff.router)
router.include_router(staff.staff_manage_router)
router.include_router(config.router)
router.include_router(ratings.router)
router.include_router(maintenance.router)
router.include_router(dashboard.router)
