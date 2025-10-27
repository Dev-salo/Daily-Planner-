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
    def create(user_id, name, description, date, time, frequency):
        db = get_db()
        cursor = db.execute(
            'INSERT INTO tasks (user_id, name, description, date, time, frequency) VALUES (?, ?, ?, ?, ?, ?)',
            (user_id, name, description, date, time, frequency)
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
    def update(task_id, name, description, date, time, frequency, status):
        db = get_db()
        db.execute(
            'UPDATE tasks SET name = ?, description = ?, date = ?, time = ?, frequency = ?, status = ? WHERE id = ?',
            (name, description, date, time, frequency, status, task_id)
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
