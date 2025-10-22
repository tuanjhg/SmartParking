from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CheckInRequest(BaseModel):
    """
    Schema cho request check-in xe vào bãi
    """
    image_url: str = Field(..., description="Đường dẫn hoặc URL đến ảnh biển số xe")
    
    class Config:
        json_schema_extra = {
            "example": {
                "image_url": "path/to/image.jpg"
            }
        }


class CheckInResponse(BaseModel):
    """
    Schema cho response sau khi check-in
    """
    status: str = Field(..., description="Trạng thái: 'ok' hoặc 'error'")
    slot_id: Optional[str] = Field(None, description="ID của slot được gán (vd: A3)")
    license_plate: Optional[str] = Field(None, description="Biển số xe nhận diện được")
    arrival_time: Optional[datetime] = Field(None, description="Thời gian xe đến")
    message: str = Field(..., description="Thông báo kết quả")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "ok",
                "slot_id": "A3",
                "license_plate": "29A-12345",
                "arrival_time": "2025-10-21T15:42:00",
                "message": "Đã gán slot A3"
            }
        }


class VehicleInfo(BaseModel):
    """
    Schema thông tin xe trong bãi
    """
    license_plate: str
    slot_id: str
    arrival_time: datetime
    image_url: Optional[str] = None
