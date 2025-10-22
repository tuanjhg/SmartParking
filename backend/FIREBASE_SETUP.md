# 🔥 Firebase Setup Guide

## 📋 Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc **"Thêm dự án"**
3. Đặt tên project: `smart-parking-project` (hoặc tên bạn thích)
4. Bỏ tích **"Enable Google Analytics"** (không bắt buộc)
5. Click **"Create project"**

---

## 🔐 Bước 2: Lấy Service Account Key

1. Trong Firebase Console, click vào biểu tượng ⚙️ **Settings** > **Project settings**
2. Chọn tab **"Service accounts"**
3. Click **"Generate new private key"**
4. Một file JSON sẽ được tải xuống (ví dụ: `smart-parking-project-firebase-adminsdk-xxxxx.json`)
5. **Đổi tên file thành:** `firebase-credentials.json`
6. **Di chuyển file vào thư mục:** `/backend/firebase-credentials.json`

⚠️ **QUAN TRỌNG:** File này chứa thông tin bảo mật, **KHÔNG** commit lên Git!

---

## 🗄️ Bước 3: Kích hoạt Firestore Database

1. Trong Firebase Console, vào menu **"Build"** > **"Firestore Database"**
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (để phát triển, sau đó cấu hình rules)
4. Chọn location gần nhất (ví dụ: `asia-southeast1`)
5. Click **"Enable"**

---

## 📦 Bước 4: (Tùy chọn) Kích hoạt Storage

Nếu muốn lưu ảnh xe vào Firebase Storage:

1. Vào menu **"Build"** > **"Storage"**
2. Click **"Get started"**
3. Chọn **"Start in test mode"**
4. Chọn location tương tự Firestore
5. Click **"Done"**

Lấy Storage Bucket name:
- Ở trang Storage, sao chép tên bucket (dạng: `your-project-id.appspot.com`)
- Cập nhật vào file `.env`:
  ```
  FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
  ```

---

## ⚙️ Bước 5: Cấu hình Backend

### 1. Cập nhật file `.env`

Tạo file `.env` từ template:
```bash
cd /home/tuanjhg/Project/SmartParking/backend
cp .env.example .env
```

Chỉnh sửa `.env`:
```bash
# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### 2. Cài đặt dependencies

```bash
# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate     # Windows

# Install Firebase
pip install -r requirements.txt
```

---

## 🧪 Bước 6: Kiểm tra kết nối

### Chạy server:
```bash
cd /home/tuanjhg/Project/SmartParking/backend
./start.sh
```

Hoặc:
```bash
uvicorn app.main:app --reload
```

### Kiểm tra logs:
Nếu kết nối thành công, bạn sẽ thấy:
```
✅ Firebase initialized successfully
✅ Using Firebase Firestore for data storage
✅ Initialized 50 parking slots in Firebase
```

Nếu **KHÔNG** có file credentials:
```
⚠️  Firebase credentials not found at firebase-credentials.json
   Running in mock mode without Firebase
⚠️  Using in-memory storage (Firebase not connected)
```

---

## 🗂️ Cấu trúc Database

### Collections trong Firestore:

#### 1. **`vehicles`** - Thông tin xe
```json
{
  "license_plate": "29A-12345",
  "slot_id": "A3",
  "arrival_time": "2025-10-21T15:42:00",
  "checkout_time": null,
  "image_url": "uploads/vehicle_20251021_154200.jpg",
  "status": "active"
}
```

#### 2. **`parking_slots`** - Trạng thái slot
```json
{
  "slot_id": "A3",
  "status": "occupied",
  "vehicle_license_plate": "29A-12345",
  "last_updated": "2025-10-21T15:42:00"
}
```

---

## 🔒 Bước 7: Cấu hình Security Rules (Production)

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // For development - allow all (KHÔNG dùng cho production!)
    // match /{document=**} {
    //   allow read, write: if true;
    // }
  }
}
```

### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📝 Lưu ý

### Fallback Mode:
- Nếu Firebase không kết nối được, hệ thống tự động chuyển sang **in-memory storage**
- Dữ liệu sẽ **mất khi restart server**
- Chỉ dùng cho development/testing

### File Structure:
```
backend/
├── firebase-credentials.json   # ⚠️ KHÔNG commit file này!
├── .env                        # ⚠️ KHÔNG commit file này!
├── .gitignore                  # Đảm bảo có ignore 2 file trên
└── app/
    ├── core/
    │   └── firebase.py         # Firebase config
    └── services/
        └── parking_service.py  # Sử dụng Firebase
```

### Troubleshooting:

**Lỗi: "Import firebase_admin could not be resolved"**
```bash
pip install firebase-admin
```

**Lỗi: "Permission denied"**
- Kiểm tra file `firebase-credentials.json` có đúng format không
- Kiểm tra quyền của file: `chmod 600 firebase-credentials.json`

**Lỗi: "Collection not found"**
- Chạy API `/api/v1/vehicles/status` để tự động khởi tạo collections

---

## 🚀 Test API với Firebase

### 1. Check-in xe:
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/vehicles/checkin" \
  -F "file=@test-image.jpg"
```

### 2. Kiểm tra Firestore Console:
- Mở Firebase Console
- Vào **Firestore Database**
- Sẽ thấy collection `vehicles` và `parking_slots` với data mới

### 3. Lấy danh sách xe:
```bash
curl http://127.0.0.1:8000/api/v1/vehicles/list
```

---

## ✅ Hoàn thành!

Backend đã được tích hợp Firebase thành công! 🎉

Dữ liệu xe và slot giờ được lưu vào **Firestore** thay vì memory.
