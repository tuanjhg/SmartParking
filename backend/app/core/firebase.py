import firebase_admin
from firebase_admin import credentials, firestore, storage
from app.core.config import settings
import os


class FirebaseConfig:
    """
    Firebase Configuration and Initialization
    """
    
    def __init__(self):
        self.db = None
        self.bucket = None
        self._initialized = False
    
    def initialize(self):
        """
        Initialize Firebase Admin SDK
        """
        if self._initialized:
            return
        
        try:
            cred_path = settings.FIREBASE_CREDENTIALS_PATH
            
            if not os.path.exists(cred_path):
                print(f"Firebase credentials not found at {cred_path}")
                print("   Running in mock mode without Firebase")
                return
            cred = credentials.Certificate(cred_path)
            
            firebase_admin.initialize_app(cred, {
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
            
            self.db = firestore.client()
            
            if settings.FIREBASE_STORAGE_BUCKET:
                self.bucket = storage.bucket()
            
            self._initialized = True
            print("Firebase initialized successfully")
            
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            print("   Running in mock mode without Firebase")
    
    def get_db(self):
        """
        Get Firestore database instance
        
        Returns:
            Firestore client or None if not initialized
        """
        if not self._initialized:
            self.initialize()
        return self.db
    
    def get_bucket(self):
        """
        Get Firebase Storage bucket
        
        Returns:
            Storage bucket or None if not configured
        """
        if not self._initialized:
            self.initialize()
        return self.bucket
    
    def is_connected(self):
        """
        Check if Firebase is connected
        
        Returns:
            True if connected, False otherwise
        """
        return self._initialized and self.db is not None

firebase_config = FirebaseConfig()


def get_firestore_db():
    """
    Dependency function to get Firestore database
    
    Returns:
        Firestore client
    """
    return firebase_config.get_db()
