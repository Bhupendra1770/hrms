live url - https://hrms-frontend-hrms7.vercel.app/
username - admin@gmail.com
password - admin


# HRMS Portal (Python + React + PostgreSQL)

This is a starter HRMS portal with:
- **Backend:** FastAPI
- **Frontend:** React + Vite
- **Database:** PostgreSQL
- **Auth:** JWT-based login

## Included Modules
- Admin registration and login
- Dashboard stats
- Department management
- Employee management
- Attendance management
- Leave request management

## Project Structure
```
hrms_portal/
  backend/
  frontend/
  docker-compose.yml
```

## Run PostgreSQL
```bash
docker compose up -d
```

## Run Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

## Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## Important First Step
Open backend Swagger docs:
- http://localhost:8000/docs

Create the first admin using:
- `POST /api/auth/register-admin`

Example:
```json
{
  "full_name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Then log in from the frontend.

## Notes
- This is a solid starter project, not a final enterprise HRMS.
- You can extend it with payroll, roles/permissions, file uploads, holidays, announcements, and performance reviews.
