import cv2
import numpy as np
from typing import Optional
import re


class OCRService:
    """
    Service xử lý nhận diện biển số xe
    Hiện tại dùng mock data, sau này có thể tích hợp:
    - Roboflow API
    - EasyOCR
    - PaddleOCR
    - Tesseract OCR
    """
    
    def __init__(self):
        """
        Khởi tạo OCR service
        """
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp']
    
    def detect_license_plate(self, image_path: str) -> Optional[str]:
        """
        Nhận diện biển số xe từ ảnh
        
        Args:
            image_path: Đường dẫn đến file ảnh
            
        Returns:
            Biển số xe hoặc None nếu không nhận diện được
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                return None
            
            license_plate = self._mock_ocr(image_path)
            
            return license_plate
            
        except Exception as e:
            print(f"Error detecting license plate: {e}")
            return None
    
    def _mock_ocr(self, image_path: str) -> str:
        """
        Mock OCR - tạo biển số giả để test
        Trong production, thay thế bằng AI model thực
        """
        import hashlib
        hash_object = hashlib.md5(image_path.encode())
        hash_hex = hash_object.hexdigest()
        
        provinces = ['29', '30', '51', '59', '72', '43']
        letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K']
        
        province = provinces[int(hash_hex[0], 16) % len(provinces)]
        letter = letters[int(hash_hex[1], 16) % len(letters)]
        numbers = ''.join([str(int(c, 16) % 10) for c in hash_hex[2:7]])
        
        return f"{province}{letter}-{numbers}"
    
    def validate_license_plate(self, plate: str) -> bool:
        """
        Kiểm tra định dạng biển số có hợp lệ không
        
        Args:
            plate: Biển số cần kiểm tra
            
        Returns:
            True nếu hợp lệ, False nếu không
        """
        pattern = r'^\d{2}[A-Z]-\d{4,5}$|^\d{2}[A-Z]\d-\d{4,5}$'
        return bool(re.match(pattern, plate))

ocr_service = OCRService()
