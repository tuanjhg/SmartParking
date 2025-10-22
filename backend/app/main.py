from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import parking
from app.api.v1 import vehicles
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Smart Parking System API - Hệ thống quản lý bãi đỗ xe thông minh"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parking.router, prefix="/api")
app.include_router(vehicles.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "message": "🚗 Smart Parking Backend is running!",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }
