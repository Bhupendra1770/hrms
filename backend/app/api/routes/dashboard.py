from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_current_user
from app.db.deps import get_db
from app.models.announcement import Announcement
from app.models.attendance import Attendance
from app.models.department import Department
from app.models.employee import Employee
from app.models.holiday import Holiday
from app.models.leave_request import LeaveRequest
from app.models.user import User

router = APIRouter(prefix='/dashboard', tags=['Dashboard'])


@router.get('/stats')
def get_dashboard_stats(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    active_employees = db.query(func.count(Employee.id)).filter(Employee.status == 'active').scalar() or 0
    inactive_employees = db.query(func.count(Employee.id)).filter(Employee.status != 'active').scalar() or 0
    total_departments = db.query(func.count(Department.id)).scalar() or 0
    total_leaves = db.query(func.count(LeaveRequest.id)).scalar() or 0
    pending_leaves = db.query(func.count(LeaveRequest.id)).filter(LeaveRequest.status == 'pending').scalar() or 0
    total_attendance = db.query(func.count(Attendance.id)).scalar() or 0
    today_present = db.query(func.count(Attendance.id)).filter(Attendance.attendance_date == date.today()).scalar() or 0
    upcoming_holidays = db.query(func.count(Holiday.id)).filter(Holiday.holiday_date >= date.today(), Holiday.holiday_date <= date.today() + timedelta(days=30)).scalar() or 0
    recent_announcements = db.query(func.count(Announcement.id)).filter(Announcement.created_at >= date.today() - timedelta(days=30)).scalar() or 0

    return {
        'total_employees': total_employees,
        'active_employees': active_employees,
        'inactive_employees': inactive_employees,
        'total_departments': total_departments,
        'total_leaves': total_leaves,
        'pending_leaves': pending_leaves,
        'total_attendance_records': total_attendance,
        'today_present': today_present,
        'upcoming_holidays': upcoming_holidays,
        'recent_announcements': recent_announcements,
    }


@router.get('/analytics')
def get_dashboard_analytics(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    today = date.today()

    departments = db.query(Department).options(joinedload(Department.employees)).all()
    department_headcount = [
        {
            'department': department.name,
            'employees': len(department.employees),
        }
        for department in departments
    ] or [{'department': 'No Departments', 'employees': 0}]

    statuses = ['pending', 'approved', 'rejected']
    leave_status_breakdown = [
        {
            'status': status,
            'count': db.query(func.count(LeaveRequest.id)).filter(LeaveRequest.status == status).scalar() or 0,
        }
        for status in statuses
    ]

    monthly_hires = []
    first_of_month = today.replace(day=1)
    for idx in range(5, -1, -1):
        month_end = first_of_month
        for _ in range(idx):
            month_end = (month_end.replace(day=1) - timedelta(days=1)).replace(day=1)
        next_month = (month_end.replace(day=28) + timedelta(days=4)).replace(day=1)
        count = db.query(func.count(Employee.id)).filter(Employee.hire_date >= month_end, Employee.hire_date < next_month).scalar() or 0
        monthly_hires.append({'month': month_end.strftime('%b %Y'), 'count': count})

    attendance_trend = []
    for idx in range(6, -1, -1):
        target_date = today - timedelta(days=idx)
        present_count = db.query(func.count(Attendance.id)).filter(Attendance.attendance_date == target_date).scalar() or 0
        attendance_trend.append({'date': target_date.strftime('%d %b'), 'present_count': present_count})

    salary_by_department = []
    for department in departments:
        employees = department.employees or []
        salaries = [float(employee.salary) for employee in employees if employee.salary is not None]
        average = sum(salaries) / len(salaries) if salaries else 0
        salary_by_department.append({
            'department': department.name,
            'employees': len(employees),
            'average_salary': f"₹ {average:,.0f}" if average else 'N/A',
        })

    recent_leaves = db.query(LeaveRequest).options(joinedload(LeaveRequest.employee).joinedload(Employee.user)).order_by(LeaveRequest.created_at.desc()).limit(5).all()

    kpis = [
        {'label': 'Headcount', 'value': db.query(func.count(Employee.id)).scalar() or 0, 'note': 'Total employee records'},
        {'label': 'Active Teams', 'value': db.query(func.count(Department.id)).scalar() or 0, 'note': 'Configured departments'},
        {'label': 'Open Leave Requests', 'value': db.query(func.count(LeaveRequest.id)).filter(LeaveRequest.status == 'pending').scalar() or 0, 'note': 'Awaiting decision'},
        {'label': 'Today Check-ins', 'value': db.query(func.count(Attendance.id)).filter(Attendance.attendance_date == today).scalar() or 0, 'note': 'Attendance logged today'},
    ]

    return {
        'kpis': kpis,
        'department_headcount': department_headcount,
        'leave_status_breakdown': leave_status_breakdown,
        'monthly_hires': monthly_hires,
        'attendance_trend': attendance_trend,
        'salary_by_department': salary_by_department,
        'recent_leaves': [
            {
                'id': leave.id,
                'employee_name': leave.employee.user.full_name if leave.employee and leave.employee.user else f'Employee #{leave.employee_id}',
                'leave_type': leave.leave_type,
                'start_date': leave.start_date.isoformat(),
                'end_date': leave.end_date.isoformat(),
                'status': leave.status,
            }
            for leave in recent_leaves
        ],
    }


@router.get('/heatmap')
def get_dashboard_heatmap(user_id: int | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    target_user_id = user_id if user_id and current_user.role == 'admin' else current_user.id
    employee = db.query(Employee).filter(Employee.user_id == target_user_id).first()

    end_date = date.today()
    start_date = end_date - timedelta(days=180)

    heatmap_data = []

    if employee:
        attendances = db.query(Attendance.attendance_date).filter(
            Attendance.employee_id == employee.id,
            Attendance.attendance_date >= start_date,
            Attendance.attendance_date <= end_date
        ).all()
        present_dates = {a[0] for a in attendances}

        leaves = db.query(LeaveRequest).filter(
            LeaveRequest.employee_id == employee.id,
            LeaveRequest.status == 'approved',
            LeaveRequest.start_date <= end_date,
            LeaveRequest.end_date >= start_date
        ).all()

        leave_dates = set()
        for lv in leaves:
            delta = lv.end_date - lv.start_date
            for i in range(delta.days + 1):
                leave_dates.add(lv.start_date + timedelta(days=i))

        current_date = start_date
        while current_date <= end_date:
            status = 'absent'
            if current_date in present_dates:
                status = 'present'
            elif current_date in leave_dates:
                status = 'leave'
            elif current_date.weekday() >= 5:
                status = 'weekend'

            if current_date < employee.hire_date:
                status = 'na'

            heatmap_data.append({
                'date': current_date.isoformat(),
                'status': status
            })
            current_date += timedelta(days=1)

    return heatmap_data
