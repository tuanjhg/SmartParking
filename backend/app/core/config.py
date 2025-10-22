from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """
    Cấu hình chung cho ứng dụng Smart Parking
    """
    APP_NAME: str = "Smart Parking System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    API_V1_PREFIX: str = "/api/v1"
    
    TOTAL_PARKING_SLOTS: int = 50
    SLOT_PREFIX: str = "A"  
    
    ROBOFLOW_API_KEY: Optional[str] = None
    ROBOFLOW_WORKSPACE: Optional[str] = None
    ROBOFLOW_PROJECT: Optional[str] = None
    
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024 

    FIREBASE_CREDENTIALS_PATH: Optional[str] = "firebase-credentials.json"
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    
    DATABASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
