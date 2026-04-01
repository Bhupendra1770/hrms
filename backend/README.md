# HRMS Backend (FastAPI + PostgreSQL)

## Features
- JWT-based admin/employee login
- Department management
- Employee management
- Attendance management
- Leave request management
- Dashboard statistics

## Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
python run.py
```

API docs:
- http://localhost:8000/docs

## First Step
Create admin from:
- `POST /api/auth/register-admin`

Example body:
```json
{
  "full_name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin@123"
}
```
