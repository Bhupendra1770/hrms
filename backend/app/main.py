# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.api.routes import auth, attendance, dashboard, departments, employees, leaves, announcements, holidays
# from app.core.config import settings
# from app.db.base import Base
# from app.db.session import engine
# import app.models  # noqa: F401

# Base.metadata.create_all(bind=engine)

# app = FastAPI(title='HRMS Portal API', version='1.0.0')

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[settings.FRONTEND_URL, 'http://127.0.0.1:5173'],
#     allow_credentials=True,
#     allow_methods=['*'],
#     allow_headers=['*'],
# )

# app.include_router(auth.router, prefix='/api')
# app.include_router(departments.router, prefix='/api')
# app.include_router(employees.router, prefix='/api')
# app.include_router(attendance.router, prefix='/api')
# app.include_router(leaves.router, prefix='/api')
# app.include_router(dashboard.router, prefix='/api')
# app.include_router(announcements.router, prefix='/api')
# app.include_router(holidays.router, prefix='/api')

# @app.get('/')
# def root():
#     return {'message': 'HRMS Portal API is running'}



from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, attendance, dashboard, departments, employees, leaves, announcements, holidays
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title='HRMS Portal API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

app.include_router(auth.router, prefix='/api')
app.include_router(departments.router, prefix='/api')
app.include_router(employees.router, prefix='/api')
app.include_router(attendance.router, prefix='/api')
app.include_router(leaves.router, prefix='/api')
app.include_router(dashboard.router, prefix='/api')
app.include_router(announcements.router, prefix='/api')
app.include_router(holidays.router, prefix='/api')

@app.get('/')
def root():
    return {'message': 'HRMS Portal API is running'}