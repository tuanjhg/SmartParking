from typing import Dict, Optional, List
from datetime import datetime
from firebase_admin import firestore
from app.core.config import settings
from app.core.firebase import firebase_config
from app.schemas.vehicle import VehicleInfo
from app.models.vehicle import Vehicle, ParkingSlot


class ParkingService:
    """
    Service quản lý bãi đỗ xe với Firebase Firestore
    - Kiểm tra slot trống
    - Gán slot cho xe
    - Quản lý danh sách xe trong bãi
    """
    
    def __init__(self):
        """
        Khởi tạo parking service
        """
        self.total_slots = settings.TOTAL_PARKING_SLOTS
        self.slot_prefix = settings.SLOT_PREFIX
        
        self.vehicles_collection = "vehicles"
        self.slots_collection = "parking_slots"
    
        firebase_config.initialize()
        self.db = firebase_config.get_db()
        
        self.use_firebase = firebase_config.is_connected()
        
        if not self.use_firebase:
            print("Using in-memory storage (Firebase not connected)")
            self.occupied_slots: Dict[str, VehicleInfo] = {}
            self.available_slots = [
                f"{self.slot_prefix}{i}" for i in range(1, self.total_slots + 1)
            ]
        else:
            print("Using Firebase Firestore for data storage")
            self._initialize_slots()
    
    def _initialize_slots(self):
        """
        Initialize parking slots in Firebase if not exists
        """
        if not self.use_firebase:
            return
        
        try:
            slots_ref = self.db.collection(self.slots_collection)
            
            # Check if slots already initialized
            existing_slots = slots_ref.limit(1).stream()
            if len(list(existing_slots)) > 0:
                return  # Already initialized
            
            # Create all slots
            batch = self.db.batch()
            for i in range(1, self.total_slots + 1):
                slot_id = f"{self.slot_prefix}{i}"
                slot = ParkingSlot(
                    slot_id=slot_id,
                    status="available",
                    last_updated=datetime.now()
                )
                slot_ref = slots_ref.document(slot_id)
                batch.set(slot_ref, slot.to_dict())
            
            batch.commit()
            print(f"Initialized {self.total_slots} parking slots in Firebase")
            
        except Exception as e:
            print(f"Error initializing slots: {e}")
    
    def get_available_slot(self) -> Optional[str]:
        """
        Lấy slot trống đầu tiên
        
        Returns:
            Slot ID hoặc None nếu bãi đầy
        """
        if not self.use_firebase:
            # In-memory mode
            if not self.available_slots:
                return None
            return self.available_slots[0]
        
        try:
            # Firebase mode
            slots_ref = self.db.collection(self.slots_collection)
            available_slots = slots_ref.where("status", "==", "available").limit(1).stream()
            
            for slot in available_slots:
                return slot.id
            
            return None  # No available slots
            
        except Exception as e:
            print(f"Error getting available slot: {e}")
            return None
    
    def assign_slot(self, license_plate: str, image_url: Optional[str] = None) -> Optional[str]:
        """
        Gán slot cho xe mới vào
        
        Args:
            license_plate: Biển số xe
            image_url: Đường dẫn ảnh xe
            
        Returns:
            Slot ID được gán hoặc None nếu bãi đầy
        """
        if not self.use_firebase:
            # In-memory mode
            for slot_id, vehicle in self.occupied_slots.items():
                if vehicle.license_plate == license_plate:
                    return None
            
            slot_id = self.get_available_slot()
            if not slot_id:
                return None
            
            vehicle_info = VehicleInfo(
                license_plate=license_plate,
                slot_id=slot_id,
                arrival_time=datetime.now(),
                image_url=image_url
            )
            
            self.occupied_slots[slot_id] = vehicle_info
            self.available_slots.remove(slot_id)
            return slot_id
        
        try:
            # Firebase mode - Check if vehicle already exists
            vehicles_ref = self.db.collection(self.vehicles_collection)
            existing = vehicles_ref.where("license_plate", "==", license_plate)\
                                   .where("checkout_time", "==", None)\
                                   .limit(1)\
                                   .stream()
            
            if len(list(existing)) > 0:
                return None  # Vehicle already in parking
            
            # Get available slot
            slot_id = self.get_available_slot()
            if not slot_id:
                return None
            
            # Create vehicle record
            vehicle = Vehicle(
                license_plate=license_plate,
                slot_id=slot_id,
                arrival_time=datetime.now(),
                image_url=image_url
            )
            
            # Use transaction to ensure consistency
            transaction = self.db.transaction()
            
            @firestore.transactional
            def update_in_transaction(transaction):
                # Add vehicle
                vehicle_ref = vehicles_ref.document()
                transaction.set(vehicle_ref, vehicle.to_dict())
                
                # Update slot status
                slot_ref = self.db.collection(self.slots_collection).document(slot_id)
                transaction.update(slot_ref, {
                    "status": "occupied",
                    "vehicle_license_plate": license_plate,
                    "last_updated": datetime.now()
                })
            
            update_in_transaction(transaction)
            return slot_id
            
        except Exception as e:
            print(f"Error assigning slot: {e}")
            return None
    
    def release_slot(self, slot_id: str) -> bool:
        """
        Giải phóng slot khi xe rời bãi
        
        Args:
            slot_id: ID của slot cần giải phóng
            
        Returns:
            True nếu thành công, False nếu slot không tồn tại
        """
        if not self.use_firebase:
            # In-memory mode
            if slot_id not in self.occupied_slots:
                return False
            
            del self.occupied_slots[slot_id]
            self.available_slots.append(slot_id)
            self.available_slots.sort()
            return True
        
        try:
            # Firebase mode
            vehicles_ref = self.db.collection(self.vehicles_collection)
            
            # Find vehicle in this slot
            vehicles = vehicles_ref.where("slot_id", "==", slot_id)\
                                   .where("checkout_time", "==", None)\
                                   .limit(1)\
                                   .stream()
            
            vehicle_doc = None
            for v in vehicles:
                vehicle_doc = v
                break
            
            if not vehicle_doc:
                return False
            
            # Update vehicle checkout time
            vehicle_ref = vehicles_ref.document(vehicle_doc.id)
            vehicle_ref.update({
                "checkout_time": datetime.now(),
                "status": "completed"
            })
            
            # Update slot status
            slot_ref = self.db.collection(self.slots_collection).document(slot_id)
            slot_ref.update({
                "status": "available",
                "vehicle_license_plate": None,
                "last_updated": datetime.now()
            })
            
            return True
            
        except Exception as e:
            print(f"Error releasing slot: {e}")
            return False
    
    def get_parking_status(self) -> Dict:
        """
        Lấy thông tin trạng thái bãi xe
        
        Returns:
            Dictionary chứa thông tin trạng thái
        """
        if not self.use_firebase:
            # In-memory mode
            occupied_count = len(self.occupied_slots)
            free_count = len(self.available_slots)
            
            return {
                "total_slots": self.total_slots,
                "occupied_slots": occupied_count,
                "free_slots": free_count,
                "status": "available" if free_count > 0 else "full",
                "occupancy_rate": round((occupied_count / self.total_slots) * 100, 2)
            }
        
        try:
            # Firebase mode
            slots_ref = self.db.collection(self.slots_collection)
            
            # Count occupied slots
            occupied = slots_ref.where("status", "==", "occupied").stream()
            occupied_count = len(list(occupied))
            
            # Count available slots
            available = slots_ref.where("status", "==", "available").stream()
            free_count = len(list(available))
            
            return {
                "total_slots": self.total_slots,
                "occupied_slots": occupied_count,
                "free_slots": free_count,
                "status": "available" if free_count > 0 else "full",
                "occupancy_rate": round((occupied_count / self.total_slots) * 100, 2)
            }
            
        except Exception as e:
            print(f"Error getting parking status: {e}")
            return {
                "total_slots": self.total_slots,
                "occupied_slots": 0,
                "free_slots": self.total_slots,
                "status": "available",
                "occupancy_rate": 0
            }
    
    def get_vehicle_by_plate(self, license_plate: str) -> Optional[VehicleInfo]:
        """
        Tìm xe theo biển số
        
        Args:
            license_plate: Biển số xe cần tìm
            
        Returns:
            VehicleInfo hoặc None nếu không tìm thấy
        """
        if not self.use_firebase:
            # In-memory mode
            for vehicle in self.occupied_slots.values():
                if vehicle.license_plate == license_plate:
                    return vehicle
            return None
        
        try:
            # Firebase mode
            vehicles_ref = self.db.collection(self.vehicles_collection)
            vehicles = vehicles_ref.where("license_plate", "==", license_plate)\
                                   .where("checkout_time", "==", None)\
                                   .limit(1)\
                                   .stream()
            
            for vehicle_doc in vehicles:
                data = vehicle_doc.to_dict()
                return VehicleInfo(
                    license_plate=data.get("license_plate"),
                    slot_id=data.get("slot_id"),
                    arrival_time=data.get("arrival_time"),
                    image_url=data.get("image_url")
                )
            
            return None
            
        except Exception as e:
            print(f"Error getting vehicle by plate: {e}")
            return None
    
    def get_all_vehicles(self) -> List[VehicleInfo]:
        """
        Lấy danh sách tất cả xe trong bãi
        
        Returns:
            List các VehicleInfo
        """
        if not self.use_firebase:
            # In-memory mode
            return list(self.occupied_slots.values())
        
        try:
            # Firebase mode
            vehicles_ref = self.db.collection(self.vehicles_collection)
            vehicles = vehicles_ref.where("checkout_time", "==", None).stream()
            
            result = []
            for vehicle_doc in vehicles:
                data = vehicle_doc.to_dict()
                vehicle_info = VehicleInfo(
                    license_plate=data.get("license_plate"),
                    slot_id=data.get("slot_id"),
                    arrival_time=data.get("arrival_time"),
                    image_url=data.get("image_url")
                )
                result.append(vehicle_info)
            
            return result
            
        except Exception as e:
            print(f"Error getting all vehicles: {e}")
            return []

parking_service = ParkingService()
