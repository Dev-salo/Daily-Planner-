from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from models import Task
from datetime import datetime, timedelta

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    return render_template('home.html')

@main_bp.route('/dashboard')
@login_required
def dashboard():
    user_tasks = Task.get_all_by_user(current_user.id)
    
    total_tasks = len(user_tasks)
    completed_tasks = sum(1 for task in user_tasks if task['status'] == 'complete')
    incomplete_tasks = total_tasks - completed_tasks
    completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    today = datetime.now().date()
    upcoming_tasks = [task for task in user_tasks if task['date'] >= str(today)][:5]
    
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    weekly_completed = sum(1 for task in user_tasks 
                          if task['status'] == 'complete' 
                          and week_start <= datetime.strptime(task['date'], '%Y-%m-%d').date() <= week_end)
    
    top_achievements = [task for task in user_tasks 
                       if task['status'] == 'complete' 
                       and week_start <= datetime.strptime(task['date'], '%Y-%m-%d').date() <= week_end][:3]
    
    return render_template('dashboard.html',
                         total=total_tasks,
                         completed=completed_tasks,
                         incomplete=incomplete_tasks,
                         percentage=round(completion_percentage, 1),
                         upcoming_tasks=upcoming_tasks,
                         weekly_completed=weekly_completed,
                         top_achievements=top_achievements)

@main_bp.route('/calendar')
@login_required
def calendar():
    return render_template('calendar.html')

@main_bp.route('/settings')
@login_required
def settings():
    return render_template('settings.html')
