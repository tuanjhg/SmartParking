## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   │
│   ├── components/
│   │   ├── CheckInModal.tsx     # Vehicle check-in modal
│   │   ├── ParkingStatus.tsx   # Status cards component
│   │   └── VehicleList.tsx     # Vehicle table component
│   │
│   ├── services/
│   │   └── api.ts            # API service layer
│   │
│   └── types/
│       └── index.d.ts        # TypeScript definitions
│
├── .env.local                # Environment variables
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

---

## ⚙️ Installation

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

The `.env.local` file is already created with:
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Start development server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---


## 👨‍💻 Author

Smart Parking System - UET Project

