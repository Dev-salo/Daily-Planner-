import sqlite3
import os
from datetime import datetime

DATABASE_FILE = 'database.db'

def get_db():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            time TIME,
            frequency TEXT NOT NULL,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'incomplete',
            email_sent INTEGER DEFAULT 0,
            notification_type TEXT DEFAULT 'silent',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            theme TEXT DEFAULT 'light',
            task_view TEXT DEFAULT 'grid',
            calendar_view TEXT DEFAULT 'month',
            timezone TEXT DEFAULT 'UTC',
            avatar TEXT DEFAULT 'avatar1',
            bg_color TEXT DEFAULT '#e8ecf1',
            bg_image TEXT,
            display_mode TEXT DEFAULT 'expanded',
            notifications_enabled INTEGER DEFAULT 1,
            email_reminders INTEGER DEFAULT 1,
            reminder_time INTEGER DEFAULT 10,
            default_priority TEXT DEFAULT 'medium',
            auto_start_timer INTEGER DEFAULT 0,
            show_completed_graph INTEGER DEFAULT 1,
            pomodoro_enabled INTEGER DEFAULT 0,
            work_duration INTEGER DEFAULT 25,
            break_duration INTEGER DEFAULT 5,
            animations_enabled INTEGER DEFAULT 1,
            sound_enabled INTEGER DEFAULT 1,
            default_homepage TEXT DEFAULT 'dashboard',
            language TEXT DEFAULT 'en',
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Check if we need to quickly patch an existing database with the new column
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN timezone TEXT DEFAULT 'UTC'")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN email_sent INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN avatar TEXT DEFAULT 'avatar1'")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN bg_color TEXT DEFAULT '#e8ecf1'")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN bg_image TEXT")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN display_mode TEXT DEFAULT 'expanded'")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN notifications_enabled INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN email_reminders INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN reminder_time INTEGER DEFAULT 10")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN default_priority TEXT DEFAULT 'medium'")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN auto_start_timer INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN show_completed_graph INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN pomodoro_enabled INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN work_duration INTEGER DEFAULT 25")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN break_duration INTEGER DEFAULT 5")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN animations_enabled INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN sound_enabled INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN default_homepage TEXT DEFAULT 'dashboard'")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE user_preferences ADD COLUMN language TEXT DEFAULT 'en'")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN notification_type TEXT DEFAULT 'silent'")
    except sqlite3.OperationalError:
        pass
    
    # Create completed_tasks table to track task history (last 7 days)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS completed_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            task_id INTEGER,
            task_name TEXT NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_date DATE NOT NULL,
            points_earned INTEGER DEFAULT 10,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create user_points table to track rewards and points
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            current_points INTEGER DEFAULT 0,
            total_points_lifetime INTEGER DEFAULT 0,
            monthly_points INTEGER DEFAULT 0,
            last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create notification_tracking table to prevent duplicate notifications
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notification_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            task_id INTEGER NOT NULL,
            notification_date DATE NOT NULL,
            notification_sent INTEGER DEFAULT 1,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, task_id, notification_date)
        )
    ''')
    
    # Add columns to tasks table if they don't exist
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN notification_sent_date DATE")
    except sqlite3.OperationalError:
        pass
    
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN last_notification_date DATE")
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")
