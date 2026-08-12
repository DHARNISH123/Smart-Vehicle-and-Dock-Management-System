# Smart Vehicle and Dock Management System

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/DHARNISH123/Smart-Vehicle-and-Dock-Management-System)

Gate-2-Dock is a full-stack yard operations system for managing vehicle gate entry, queue monitoring, dock allocation, vehicle tracking, KPI reports, user administration, and live display boards.

## Features

- Role-based admin login
- Vehicle gate entry with token generation
- Live vehicle queue monitoring
- Dock availability and manual allocation
- Vehicle tracking and status history
- Dashboard KPIs and recent activity
- Admin user list
- Display board for gate and dock visibility
- Gate2Dock-style responsive interface

## Tech Stack

**Backend**

- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-SocketIO
- SQLite by default, PostgreSQL supported through `DATABASE_URL`

**Frontend**

- React
- Vite
- Tailwind CSS
- Material UI
- Recharts
- Axios

## Project Structure

```text
Smart Vehicle & Dock Management System/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   ├── routes/
│   └── services/
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .gitignore
└── README.md
```

## Default Login

```text
Username: admin
Password: admin123
```

## Run Locally

Open two terminals.

### 1. Backend

```powershell
cd "c:\Users\Dharnish\Documents\Smart Vehicle & Dock Management System\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/ping
```

### 2. Frontend

```powershell
cd "c:\Users\Dharnish\Documents\Smart Vehicle & Dock Management System\frontend"
npm install
npm run dev -- --host 0.0.0.0
```

Frontend URL:

```text
http://localhost:3000
```

## Environment Variables

The backend uses SQLite automatically if no database URL is provided.

Optional variables:

```powershell
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/smartdock"
$env:SECRET_KEY = "your-secret-key"
$env:JWT_SECRET_KEY = "your-jwt-secret"
$env:REDIS_URL = "redis://localhost:6379/0"
$env:WHATSAPP_ACCOUNT_SID = "your-twilio-sid"
$env:WHATSAPP_AUTH_TOKEN = "your-twilio-token"
$env:WHATSAPP_FROM = "whatsapp:+14155238886"
```

## Build Frontend

```powershell
cd frontend
npm run build
```

## Notes

- Local generated files such as `backend/venv`, `frontend/node_modules`, `frontend/dist`, logs, cache files, and `backend/smartdock.db` are ignored by git.
- The backend seeds the default admin user, docks, suppliers, and transporters when the app starts.
- The frontend expects the backend API to run on `http://localhost:5000`.
