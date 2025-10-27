# Daily Planner System

A professional full-stack web application for managing daily tasks, calendar events, and notes.

## Overview

This is a comprehensive productivity application built with Flask (Python) that helps users organize their tasks, track progress, manage notes, and visualize their schedule on an interactive calendar.

## Recent Changes

**October 27, 2025**
- Initial project setup and implementation
- Complete authentication system with Flask-Login
- Task management with CRUD operations, status tracking, and frequency options
- Interactive calendar view with FullCalendar.js
- Notes system with Quill.js rich text editor
- Export functionality (PDF and CSV)
- Settings page with theme toggle and preferences
- Responsive design with Bootstrap 5 and custom animations

## Project Architecture

### Backend (Flask)
- **app.py**: Main application entry point with Flask-Login configuration
- **database.py**: SQLite database initialization and connection management
- **models.py**: User, Task, and Note model classes with CRUD methods
- **blueprints/**:
  - `auth.py`: Registration, login, and logout routes
  - `tasks.py`: Task CRUD operations and export endpoints
  - `notes.py`: Note management routes
  - `main.py`: Home, dashboard, calendar, and settings routes

### Database Schema (SQLite)
- **users**: id, name, email, password_hash, created_at
- **tasks**: id, user_id, name, description, date, time, frequency, status, created_at
- **notes**: id, user_id, content, date_created
- **user_preferences**: id, user_id, theme, task_view, calendar_view

### Frontend
- **templates/**: Jinja2 HTML templates
  - Base template with responsive navbar and theme support
  - Authentication pages (login, register)
  - Dashboard with statistics and progress tracking
  - Task management page with modal forms
  - Calendar view with FullCalendar.js
  - Notes page with Quill.js editor
  - Settings page with theme and preference controls
- **static/**:
  - `css/custom.css`: Custom styles with animations and theme support
  - `js/main.js`: Theme toggle, notifications, and UI interactions
  - `js/settings.js`: Settings page functionality

## Features

### ✅ Implemented
1. **User Authentication**
   - Secure registration with email validation
   - Login with "Remember Me" option
   - Password hashing with Werkzeug
   - Session management with Flask-Login

2. **Task Management**
   - Create, read, update, delete tasks
   - Task fields: name, description, date, time, frequency
   - Frequency options: Daily, Weekly, Monthly
   - Status tracking: Complete/Incomplete
   - Progress overview with completion percentage
   - Colored badges for frequency types

3. **Dashboard**
   - Welcome message with user's name
   - Overall statistics (total, completed, incomplete tasks)
   - Progress bar with completion percentage
   - Upcoming tasks preview
   - Weekly achievements (top 3 completed tasks)

4. **Calendar View**
   - Interactive FullCalendar.js integration
   - All tasks displayed with color coding
   - Month, week, and day views
   - Click on tasks to view details
   - Click on dates to create new tasks

5. **Notes System**
   - Rich text editor with Quill.js
   - Create, edit, delete notes
   - Formatted content support
   - Timestamp tracking

6. **Export Functionality**
   - Export tasks to PDF with formatted table
   - Export tasks to CSV for spreadsheet use
   - Includes all task details

7. **Settings & Customization**
   - Light/Dark theme toggle (saved in localStorage)
   - Task view options (Grid/List)
   - Display mode (Compact/Expanded)
   - Calendar view preferences (Day/Week/Month)
   - Browser notification settings

8. **Design & UX**
   - Responsive design (mobile-first)
   - Bootstrap 5 components
   - Custom CSS with gradients and shadows
   - AOS.js scroll animations
   - Smooth transitions and hover effects
   - Toast notifications for user feedback

### 🔮 Future Enhancements
- AI chatbot for task suggestions and productivity tips
- Task priority levels with color-coded indicators
- Recurring task automation
- Collaborative task sharing
- Mobile app with offline sync
- Automated tests (unit + integration)
- User preference persistence in database (currently localStorage)

## Technology Stack

**Backend:**
- Python 3.x
- Flask (web framework)
- Flask-Login (authentication)
- Werkzeug (password hashing)
- SQLite3 (database)
- ReportLab (PDF generation)

**Frontend:**
- HTML5, CSS3, JavaScript (ES6)
- Bootstrap 5 (UI framework)
- AOS.js (animations)
- FullCalendar.js (calendar view)
- Quill.js (rich text editor)
- Bootstrap Icons

## Running the Application

The Flask server is configured to run automatically on port 5000. Access the application at the preview URL provided by Replit.

## User Workflow

1. **New User**: Register → Login → Dashboard
2. **Add Tasks**: Dashboard/Tasks → Add Task → Fill form → Save
3. **View Calendar**: Calendar → See tasks by date → Click for details
4. **Create Notes**: Notes → New Note → Write content → Save
5. **Export Data**: Tasks → Export to PDF or CSV
6. **Customize**: Settings → Change theme, view preferences

## Security Features

- Password hashing with Werkzeug's PBKDF2
- Flask-Login session management
- User ownership validation on all data access
- SQL injection prevention via parameterized queries
- Email validation on registration
- Password length requirements (minimum 6 characters)

## Directory Structure

```
project_root/
├── app.py (main Flask application)
├── database.py (database initialization)
├── models.py (data models)
├── blueprints/ (Flask blueprints)
│   ├── auth.py
│   ├── tasks.py
│   ├── notes.py
│   └── main.py
├── templates/ (Jinja2 templates)
│   ├── base.html
│   ├── home.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── tasks.html
│   ├── calendar.html
│   ├── notes.html
│   └── settings.html
├── static/ (CSS, JS, images)
│   ├── css/custom.css
│   └── js/
│       ├── main.js
│       └── settings.js
└── exports/ (generated exports)
    ├── pdf/
    └── csv/
```

## Notes for Development

- Database is SQLite3 (database.db created on first run)
- Sessions use SESSION_SECRET environment variable
- Development server runs with debug mode enabled
- All static files have cache busting via random hex values
- Theme preference stored in browser localStorage
- The application follows Flask blueprint pattern for modularity
