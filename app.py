import os
from dotenv import load_dotenv


load_dotenv()

from flask import Flask
from flask_login import LoginManager
from database import init_db
from models import User
from email_notifications import init_mail
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

from blueprints.main import main_bp
from blueprints.auth import auth_bp
from blueprints.tasks import tasks_bp
from blueprints.notes import notes_bp
from blueprints.assistant import assistant_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'your-secret-key-here-change-in-production')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


init_mail(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    return User.get(int(user_id))


init_db()


app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(notes_bp)
app.register_blueprint(assistant_bp)

@app.context_processor
def inject_cache_buster():
    return {'cache_buster': os.urandom(8).hex()}

@app.route('/api/next-task', methods=['GET'])
def get_next_task():
    from flask_login import current_user
    from models import Task
    
    if not current_user.is_authenticated:
        return {'error': 'Not authenticated'}, 401
    
    user_tasks = Task.get_all_by_user(current_user.id)
    now = datetime.now()

    next_task = None
    for task in user_tasks:
        if task['status'] == 'incomplete' and task['time']:
            try:
                task_datetime = datetime.strptime(
                    f"{task['date']} {task['time']}", '%Y-%m-%d %H:%M'
                )
                if task_datetime > now:
                    if next_task is None or task_datetime < datetime.strptime(
                        f"{next_task['date']} {next_task['time']}", '%Y-%m-%d %H:%M'
                    ):
                        next_task = task
            except ValueError:
                continue
    
    if next_task:
        return {
            'id': next_task['id'],
            'name': next_task['name'],
            'date': next_task['date'],
            'time': next_task['time'],
            'priority': next_task['priority']
        }
    
    return {'message': 'No upcoming tasks'}, 404


@app.route('/api/task/<int:task_id>', methods=['GET'])
def get_task_details(task_id):
    from flask_login import current_user
    from models import Task
    
    if not current_user.is_authenticated:
        return {'error': 'Not authenticated'}, 401
    
    task = Task.get_by_id(task_id)
    
    if not task or task['user_id'] != current_user.id:
        return {'error': 'Task not found'}, 404
    
    return {
        'id': task['id'],
        'name': task['name'],
        'date': task['date'],
        'time': task['time'],
        'priority': task['priority'],
        'notification_type': task['notification_type'] or 'silent',
        'description': task['description'] or ''
    }




def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_send_task_emails, 'interval', minutes=1, id='task_email_scheduler')
    scheduler.start()
    print("Task email scheduler started")


def check_and_send_task_emails():
    with app.app_context():
        from models import NotificationTracker
        from email_notifications import send_task_reminder_email

        now = datetime.now()
        current_date = now.strftime('%Y-%m-%d')
        current_time = now.strftime('%H:%M')

        db = __import__('database').get_db()
        tasks = db.execute(
            'SELECT t.*, u.email, u.name as user_name FROM tasks t '
            'JOIN users u ON t.user_id = u.id '
            'WHERE t.date = ? AND t.status = ? AND t.time IS NOT NULL',
            (current_date, 'incomplete')
        ).fetchall()
        db.close()

        for task in tasks:
            try:
                task_datetime = datetime.strptime(
                    f"{current_date} {task['time']}", '%Y-%m-%d %H:%M'
                )
                current_datetime = datetime.strptime(
                    f"{current_date} {current_time}", '%Y-%m-%d %H:%M'
                )

                if NotificationTracker.has_notification_been_sent(
                    task['user_id'], task['id'], current_date
                ):
                    continue

                time_diff = (task_datetime - current_datetime).total_seconds()

                if 0 <= time_diff <= 60:
                    send_task_reminder_email(
                        task['email'],
                        task['user_name'],
                        task['name'],
                        task['time'],
                        current_date,
                        task['id'],
                        task['user_id'],
                        task['description'] or '',
                        notification_type=task['notification_type'] or 'silent'
                    )

            except ValueError:
                continue

        print("Task notification check completed")


start_scheduler()




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)