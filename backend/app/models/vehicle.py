from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel


class Vehicle(BaseModel):
    """
    Model cho xe trong Firebase Firestore
    """
    license_plate: str
    slot_id: str
    arrival_time: datetime
    image_url: Optional[str] = None
    checkout_time: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to dictionary for Firestore
        """
        return {
            "license_plate": self.license_plate,
            "slot_id": self.slot_id,
            "arrival_time": self.arrival_time,
            "image_url": self.image_url,
            "checkout_time": self.checkout_time,
            "status": "active" if not self.checkout_time else "completed"
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Vehicle":
        """
        Create Vehicle from Firestore document
        """
        return cls(
            license_plate=data.get("license_plate"),
            slot_id=data.get("slot_id"),
            arrival_time=data.get("arrival_time"),
            image_url=data.get("image_url"),
            checkout_time=data.get("checkout_time")
        )


class ParkingSlot(BaseModel):
    """
    Model cho slot đỗ xe trong Firebase
    """
    slot_id: str
    status: str  
    vehicle_license_plate: Optional[str] = None
    last_updated: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert model to dictionary for Firestore
        """
        return {
            "slot_id": self.slot_id,
            "status": self.status,
            "vehicle_license_plate": self.vehicle_license_plate,
            "last_updated": self.last_updated
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ParkingSlot":
        """
        Create ParkingSlot from Firestore document
        """
        return cls(
            slot_id=data.get("slot_id"),
            status=data.get("status", "available"),
            vehicle_license_plate=data.get("vehicle_license_plate"),
            last_updated=data.get("last_updated", datetime.now())
        )
