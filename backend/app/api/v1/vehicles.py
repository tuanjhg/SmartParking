from fastapi import APIRouter, UploadFile, File, HTTPException
from datetime import datetime
import os
import shutil
from typing import Optional

from app.schemas.vehicle import CheckInRequest, CheckInResponse
from app.services.ocr_service import ocr_service
from app.services.parking_service import parking_service
from app.core.config import settings

router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)


@router.post("/checkin", response_model=CheckInResponse)
async def check_in_vehicle(file: UploadFile = File(...)):
    """
    API Check-in xe vào bãi
    
    Nhận ảnh biển số xe, nhận diện và gán slot
    
    Returns:
        CheckInResponse với thông tin slot và biển số
    """
    try:
        if parking_service.get_available_slot() is None:
            return CheckInResponse(
                status="error",
                message="Bãi xe đã đầy! Vui lòng quay lại sau."
            )
        
        upload_dir = settings.UPLOAD_DIR
        os.makedirs(upload_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"vehicle_{timestamp}{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        license_plate = ocr_service.detect_license_plate(file_path)
        
        if not license_plate:
            return CheckInResponse(
                status="error",
                message="Không thể nhận diện biển số xe. Vui lòng thử lại với ảnh rõ hơn."
            )
        
        existing_vehicle = parking_service.get_vehicle_by_plate(license_plate)
        if existing_vehicle:
            return CheckInResponse(
                status="error",
                license_plate=license_plate,
                slot_id=existing_vehicle.slot_id,
                message=f"Xe {license_plate} đã có trong bãi tại slot {existing_vehicle.slot_id}"
            )
        
        slot_id = parking_service.assign_slot(license_plate, file_path)
        
        if not slot_id:
            return CheckInResponse(
                status="error",
                license_plate=license_plate,
                message="Không thể gán slot. Bãi xe có thể đã đầy."
            )
        
        return CheckInResponse(
            status="ok",
            slot_id=slot_id,
            license_plate=license_plate,
            arrival_time=datetime.now(),
            message=f"Đã gán slot {slot_id} cho xe {license_plate}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi xử lý check-in: {str(e)}"
        )


@router.get("/status")
def get_parking_status():
    """
    Lấy trạng thái bãi đỗ xe
    
    Returns:
        Thông tin số slot trống, đã dùng, tỷ lệ lấp đầy
    """
    return parking_service.get_parking_status()


@router.get("/list")
def list_vehicles():
    """
    Lấy danh sách tất cả xe trong bãi
    
    Returns:
        Danh sách các xe đang đỗ trong bãi
    """
    vehicles = parking_service.get_all_vehicles()
    return {
        "total": len(vehicles),
        "vehicles": vehicles
    }


# @router.post("/checkout/{slot_id}")
# def check_out_vehicle(slot_id: str):
#     """
#     API Check-out xe khỏi bãi
    
#     Args:
#         slot_id: ID của slot cần giải phóng (vd: A3)
        
#     Returns:
#         Thông báo kết quả
#     """
#     success = parking_service.release_slot(slot_id)
    
#     if success:
#         return {
#             "status": "ok",
#             "message": f"Xe tại slot {slot_id} đã rời bãi"
#         }
#     else:
#         raise HTTPException(
#             status_code=404,
#             detail=f"Không tìm thấy xe tại slot {slot_id}"
#         )
