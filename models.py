from flask_login import UserMixin
from database import get_db

class User(UserMixin):
    def __init__(self, id, name, email, password_hash):
        self.id = id
        self.name = name
        self.email = email
        self.password_hash = password_hash
    
    @staticmethod
    def get(user_id):
        db = get_db()
        user_data = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        db.close()
        if user_data:
            return User(user_data['id'], user_data['name'], user_data['email'], user_data['password_hash'])
        return None
    
    @staticmethod
    def get_by_email(email):
        db = get_db()
        user_data = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        db.close()
        if user_data:
            return User(user_data['id'], user_data['name'], user_data['email'], user_data['password_hash'])
        return None
    
    @staticmethod
    def create(name, email, password_hash):
        db = get_db()
        cursor = db.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                           (name, email, password_hash))
        db.commit()
        user_id = cursor.lastrowid
        db.close()
        return User.get(user_id)

class Task:
    @staticmethod
    def create(user_id, name, description, date, time, frequency, priority='medium', notification_type='silent'):
        db = get_db()
        cursor = db.execute(
            'INSERT INTO tasks (user_id, name, description, date, time, frequency, priority, notification_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            (user_id, name, description, date, time, frequency, priority, notification_type)
        )
        db.commit()
        task_id = cursor.lastrowid
        db.close()
        return task_id
    
    @staticmethod
    def get_all_by_user(user_id):
        db = get_db()
        tasks = db.execute('SELECT * FROM tasks WHERE user_id = ? ORDER BY date, time', (user_id,)).fetchall()
        db.close()
        return tasks
    
    @staticmethod
    def get_by_id(task_id):
        db = get_db()
        task = db.execute('SELECT * FROM tasks WHERE id = ?', (task_id,)).fetchone()
        db.close()
        return task
    
    @staticmethod
    def update(task_id, name, description, date, time, frequency, priority, status, notification_type='silent'):
        db = get_db()
        db.execute(
            'UPDATE tasks SET name = ?, description = ?, date = ?, time = ?, frequency = ?, priority = ?, status = ?, notification_type = ? WHERE id = ?',
            (name, description, date, time, frequency, priority, status, notification_type, task_id)
        )
        db.commit()
        db.close()
    
    @staticmethod
    def delete(task_id):
        db = get_db()
        db.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        db.commit()
        db.close()
    
    @staticmethod
    def update_status(task_id, status):
        db = get_db()
        db.execute('UPDATE tasks SET status = ? WHERE id = ?', (status, task_id))
        db.commit()
        db.close()

class Note:
    @staticmethod
    def create(user_id, content):
        db = get_db()
        cursor = db.execute('INSERT INTO notes (user_id, content) VALUES (?, ?)', (user_id, content))
        db.commit()
        note_id = cursor.lastrowid
        db.close()
        return note_id
    
    @staticmethod
    def get_all_by_user(user_id):
        db = get_db()
        notes = db.execute('SELECT * FROM notes WHERE user_id = ? ORDER BY date_created DESC', (user_id,)).fetchall()
        db.close()
        return notes
    
    @staticmethod
    def get_by_id(note_id):
        db = get_db()
        note = db.execute('SELECT * FROM notes WHERE id = ?', (note_id,)).fetchone()
        db.close()
        return note
    
    @staticmethod
    def update(note_id, content):
        db = get_db()
        db.execute('UPDATE notes SET content = ? WHERE id = ?', (content, note_id))
        db.commit()
        db.close()
    
    @staticmethod
    def delete(note_id):
        db = get_db()
        db.execute('DELETE FROM notes WHERE id = ?', (note_id,))
        db.commit()
        db.close()


class CompletedTask:
    """Track completed tasks for history and rewards"""
    
    @staticmethod
    def create(user_id, task_id, task_name, completed_date, points_earned=10):
        """Record a completed task"""
        db = get_db()
        cursor = db.execute(
            'INSERT INTO completed_tasks (user_id, task_id, task_name, completed_date, points_earned) VALUES (?, ?, ?, ?, ?)',
            (user_id, task_id, task_name, completed_date, points_earned)
        )
        db.commit()
        record_id = cursor.lastrowid
        db.close()
        return record_id
        
    @staticmethod
    def get_record(user_id, task_id, completed_date):
        """Check if a specific task was already completed on a specific date"""
        db = get_db()
        record = db.execute(
            'SELECT * FROM completed_tasks WHERE user_id = ? AND task_id = ? AND completed_date = ?',
            (user_id, task_id, completed_date)
        ).fetchone()
        db.close()
        return record
        
    @staticmethod
    def remove_by_task_and_date(user_id, task_id, completed_date):
        """Remove a completed task record for a specific date (used when marking a completed task as pending)"""
        db = get_db()
        db.execute(
            'DELETE FROM completed_tasks WHERE user_id = ? AND task_id = ? AND completed_date = ?',
            (user_id, task_id, completed_date)
        )
        db.commit()
        db.close()
    
    @staticmethod
    def get_last_7_days(user_id):
        """Get completed tasks from last 7 days"""
        from datetime import datetime, timedelta
        db = get_db()
        seven_days_ago = (datetime.now() - timedelta(days=7)).date()
        tasks = db.execute(
            'SELECT * FROM completed_tasks WHERE user_id = ? AND completed_date >= ? ORDER BY completed_at DESC',
            (user_id, seven_days_ago)
        ).fetchall()
        db.close()
        return tasks
    
    @staticmethod
    def get_count_by_date(user_id, date):
        """Get count of completed tasks on a specific date"""
        db = get_db()
        count = db.execute(
            'SELECT COUNT(*) as count FROM completed_tasks WHERE user_id = ? AND completed_date = ?',
            (user_id, date)
        ).fetchone()
        db.close()
        return count['count'] if count else 0
    
    @staticmethod
    def cleanup_old_records(days=7):
        """Remove completed task records older than X days"""
        from datetime import datetime, timedelta
        db = get_db()
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        db.execute('DELETE FROM completed_tasks WHERE completed_date < ?', (cutoff_date,))
        db.commit()
        db.close()


class Points:
    """Manage user points and rewards"""
    
    @staticmethod
    def initialize_for_user(user_id):
        """Initialize points record for new user"""
        db = get_db()
        existing = db.execute('SELECT id FROM user_points WHERE user_id = ?', (user_id,)).fetchone()
        if not existing:
            db.execute(
                'INSERT INTO user_points (user_id, current_points, total_points_lifetime, monthly_points) VALUES (?, 0, 0, 0)',
                (user_id,)
            )
            db.commit()
        db.close()
    
    @staticmethod
    def get_user_points(user_id):
        """Get user's current points"""
        db = get_db()
        points = db.execute('SELECT * FROM user_points WHERE user_id = ?', (user_id,)).fetchone()
        db.close()
        if not points:
            Points.initialize_for_user(user_id)
            return Points.get_user_points(user_id)
        return points
    
    @staticmethod
    def add_points(user_id, points_amount, reason='task_completed'):
        """Add points to user"""
        from datetime import datetime
        db = get_db()
        
        # Ensure user has points record
        Points.initialize_for_user(user_id)
        
        # Check if month has changed and reset if needed
        Points.check_and_reset_monthly(user_id)
        
        # Update points
        current = Points.get_user_points(user_id)
        new_current = current['current_points'] + points_amount
        new_total = current['total_points_lifetime'] + points_amount
        new_monthly = current['monthly_points'] + points_amount
        
        db.execute(
            'UPDATE user_points SET current_points = ?, total_points_lifetime = ?, monthly_points = ?, updated_at = ? WHERE user_id = ?',
            (new_current, new_total, new_monthly, datetime.now(), user_id)
        )
        db.commit()
        db.close()
        
    @staticmethod
    def subtract_points(user_id, points_amount, reason='task_uncompleted'):
        """Subtract points from user when a task is marked incomplete"""
        from datetime import datetime
        db = get_db()
        
        # Ensure user has points record
        Points.initialize_for_user(user_id)
        
        current = Points.get_user_points(user_id)
        # Ensure points don't go below 0
        new_current = max(0, current['current_points'] - points_amount)
        new_total = max(0, current['total_points_lifetime'] - points_amount)
        new_monthly = max(0, current['monthly_points'] - points_amount)
        
        db.execute(
            'UPDATE user_points SET current_points = ?, total_points_lifetime = ?, monthly_points = ?, updated_at = ? WHERE user_id = ?',
            (new_current, new_total, new_monthly, datetime.now(), user_id)
        )
        db.commit()
        db.close()
    
    @staticmethod
    def check_and_reset_monthly(user_id):
        """Check if a month has passed and reset monthly points"""
        from datetime import datetime
        db = get_db()
        
        points = db.execute('SELECT last_reset FROM user_points WHERE user_id = ?', (user_id,)).fetchone()
        if points:
            last_reset = datetime.fromisoformat(points['last_reset'])
            now = datetime.now()
            
            # Check if we're in a different month
            if last_reset.month != now.month or last_reset.year != now.year:
                db.execute(
                    'UPDATE user_points SET monthly_points = 0, last_reset = ? WHERE user_id = ?',
                    (now, user_id)
                )
                db.commit()
        db.close()
    
    @staticmethod
    def get_monthly_points(user_id):
        """Get user's monthly points"""
        Points.check_and_reset_monthly(user_id)
        points = Points.get_user_points(user_id)
        return points['monthly_points'] if points else 0


class NotificationTracker:
    """Track notification sending to prevent duplicates"""
    
    @staticmethod
    def has_notification_been_sent(user_id, task_id, notification_date):
        """Check if notification was already sent for a task on a specific date"""
        db = get_db()
        record = db.execute(
            'SELECT id FROM notification_tracking WHERE user_id = ? AND task_id = ? AND notification_date = ? AND notification_sent = 1',
            (user_id, task_id, notification_date)
        ).fetchone()
        db.close()
        return record is not None
    
    @staticmethod
    def mark_notification_sent(user_id, task_id, notification_date):
        """Mark notification as sent for a task on a specific date"""
        from datetime import datetime
        db = get_db()
        try:
            db.execute(
                'INSERT INTO notification_tracking (user_id, task_id, notification_date, notification_sent, sent_at) VALUES (?, ?, ?, 1, ?)',
                (user_id, task_id, notification_date, datetime.now())
            )
            db.commit()
        except:
            # Record already exists, update it
            db.execute(
                'UPDATE notification_tracking SET notification_sent = 1, sent_at = ? WHERE user_id = ? AND task_id = ? AND notification_date = ?',
                (datetime.now(), user_id, task_id, notification_date)
            )
            db.commit()
        db.close()
    
    @staticmethod
    def cleanup_old_records(days=30):
        """Remove notification tracking records older than X days"""
        from datetime import datetime, timedelta
        db = get_db()
        cutoff_date = (datetime.now() - timedelta(days=days)).date()
        db.execute('DELETE FROM notification_tracking WHERE notification_date < ?', (cutoff_date,))
        db.commit()
        db.close()
