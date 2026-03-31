from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from models import Task, User, Points, CompletedTask
from database import get_db
from datetime import datetime, timedelta
import pytz
from werkzeug.security import generate_password_hash, check_password_hash

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
    upcoming_tasks = [task for task in user_tasks if task['date'] >= str(today) and task['status'] == 'incomplete'][:5]
    
    # Sort upcoming tasks by time
    upcoming_tasks = sorted(upcoming_tasks, key=lambda x: (x['time'] or '99:99'))
    
    # Get user points
    Points.initialize_for_user(current_user.id)
    user_points = Points.get_user_points(current_user.id)
    current_points = user_points['current_points'] if user_points else 0
    
    # Get last 7 days completed tasks
    recent_completed = CompletedTask.get_last_7_days(current_user.id)
    
    return render_template('dashboard.html',
                         total=total_tasks,
                         completed=completed_tasks,
                         incomplete=incomplete_tasks,
                         percentage=round(completion_percentage, 1),
                         upcoming_tasks=upcoming_tasks,
                         current_points=current_points,
                         recent_completed_tasks=recent_completed)

@main_bp.route('/calendar')
@login_required
def calendar():
    return render_template('calendar.html')

@main_bp.route('/timer')
@login_required
def timer():
    """Display standalone timer page (not related to tasks)"""
    return render_template('timer.html')

@main_bp.route('/settings')
@login_required
def settings():
    db = get_db()
    prefs = db.execute('SELECT * FROM user_preferences WHERE user_id = ?', (current_user.id,)).fetchone()
    db.close()
    
    # Set defaults for essential preferences
    current_tz = prefs['timezone'] if prefs and 'timezone' in prefs.keys() else 'UTC'
    calendar_view = prefs['calendar_view'] if prefs and 'calendar_view' in prefs.keys() else 'month'
    session_timeout = prefs['session_timeout_minutes'] if prefs and 'session_timeout_minutes' in prefs.keys() else 30
    
    # Get common timezones
    common_timezones = pytz.common_timezones
    
    return render_template('settings.html', 
                         current_tz=current_tz,
                         timezones=common_timezones,
                         calendar_view=calendar_view,
                         session_timeout=session_timeout)

@main_bp.route('/settings/update_timezone', methods=['POST'])
@login_required
def update_timezone():
    timezone = request.form.get('timezone', 'UTC')
    
    if timezone not in pytz.all_timezones:
        return jsonify({'success': False, 'message': 'Invalid timezone'}), 400
        
    db = get_db()
    
    # Ensure preference row exists
    existing = db.execute('SELECT id FROM user_preferences WHERE user_id = ?', (current_user.id,)).fetchone()
    if not existing:
        db.execute('INSERT INTO user_preferences (user_id, timezone) VALUES (?, ?)', (current_user.id, timezone))
    else:
        db.execute('UPDATE user_preferences SET timezone = ? WHERE user_id = ?', (timezone, current_user.id))
        
    db.commit()
    db.close()
    
    return jsonify({'success': True})

@main_bp.route('/settings/update_avatar', methods=['POST'])
@login_required
def update_avatar():
    avatar = request.form.get('avatar', 'avatar1')
    
    # Validate avatar choice
    valid_avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5']
    if avatar not in valid_avatars:
        return jsonify({'success': False, 'message': 'Invalid avatar'}), 400
        
    db = get_db()
    
    # Ensure preference row exists
    existing = db.execute('SELECT id FROM user_preferences WHERE user_id = ?', (current_user.id,)).fetchone()
    if not existing:
        db.execute('INSERT INTO user_preferences (user_id, avatar) VALUES (?, ?)', (current_user.id, avatar))
    else:
        db.execute('UPDATE user_preferences SET avatar = ? WHERE user_id = ?', (avatar, current_user.id))
        
    db.commit()
    db.close()
    
    return jsonify({'success': True})

@main_bp.route('/settings/update_bg_color', methods=['POST'])
@login_required
def update_bg_color():
    bg_color = request.form.get('bg_color', '#e8ecf1')
    
    # Basic color validation (hex color)
    if not bg_color.startswith('#') or len(bg_color) not in [7, 4]:
        return jsonify({'success': False, 'message': 'Invalid color format'}), 400
        
    db = get_db()
    
    # Ensure preference row exists
    existing = db.execute('SELECT id FROM user_preferences WHERE user_id = ?', (current_user.id,)).fetchone()
    if not existing:
        db.execute('INSERT INTO user_preferences (user_id, bg_color) VALUES (?, ?)', (current_user.id, bg_color))
    else:
        db.execute('UPDATE user_preferences SET bg_color = ? WHERE user_id = ?', (bg_color, current_user.id))
        
    db.commit()
    db.close()
    
    return jsonify({'success': True})

@main_bp.route('/settings/change_password', methods=['POST'])
@login_required
def change_password():
    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')
    
    if not current_password or not new_password or not confirm_password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400
        
    if new_password != confirm_password:
        return jsonify({'success': False, 'message': 'New passwords do not match.'}), 400
        
    # Verify current password
    user = User.get(current_user.id)
    if not check_password_hash(user.password_hash, current_password):
        return jsonify({'success': False, 'message': 'Incorrect current password.'}), 400
        
    # Update to new password
    hashed_pwd = generate_password_hash(new_password)
    
    db = get_db()
    db.execute('UPDATE users SET password_hash = ? WHERE id = ?', (hashed_pwd, current_user.id))
    db.commit()
    db.close()
    
    return jsonify({'success': True, 'message': 'Password successfully changed!'})

@main_bp.route('/settings/update_profile', methods=['POST'])
@login_required
def update_profile():
    username = request.form.get('username')
    email = request.form.get('email')
    
    db = get_db()
    
    if username:
        db.execute('UPDATE users SET name = ? WHERE id = ?', (username, current_user.id))
    
    if email:
        # Check if email is already taken
        existing = db.execute('SELECT id FROM users WHERE email = ? AND id != ?', (email, current_user.id)).fetchone()
        if existing:
            db.close()
            return jsonify({'success': False, 'message': 'Email already in use'}), 400
        db.execute('UPDATE users SET email = ? WHERE id = ?', (email, current_user.id))
    
    db.commit()
    db.close()
    return jsonify({'success': True})

@main_bp.route('/settings/update_session_timeout', methods=['POST'])
@login_required
def update_session_timeout():
    """Update session timeout preference (5, 10, 15, 30 minutes)"""
    try:
        session_timeout = int(request.form.get('session_timeout', 30))
        
        # Validate: only allow 5, 10, 15, or 30 minutes
        valid_timeouts = [5, 10, 15, 30]
        if session_timeout not in valid_timeouts:
            return jsonify({'success': False, 'message': 'Invalid session timeout'}), 400
        
        db = get_db()
        
        # Ensure preference row exists
        existing = db.execute('SELECT id FROM user_preferences WHERE user_id = ?', (current_user.id,)).fetchone()
        if not existing:
            db.execute('INSERT INTO user_preferences (user_id, session_timeout_minutes) VALUES (?, ?)', 
                      (current_user.id, session_timeout))
        else:
            db.execute('UPDATE user_preferences SET session_timeout_minutes = ? WHERE user_id = ?', 
                      (session_timeout, current_user.id))
        
        db.commit()
        db.close()
        
        return jsonify({'success': True, 'message': f'Session timeout set to {session_timeout} minutes'})
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Invalid timeout value'}), 400
