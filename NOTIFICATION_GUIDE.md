# Email & Browser Notification Implementation Summary

## ✅ What's Implemented

Your Daily Planner now has **dual notifications**:
1. **Browser Notifications** - Instant popups when you add tasks and when they're due
2. **Email Notifications** - Full-featured emails to your Gmail inbox

## 📋 What You Get

### When You Add a Task
- ✅ Browser notification (immediate)
- ✅ Email confirmation (if configured)
- Example: "✅ Task Added - 'Wake up' scheduled for 5:49 AM"

### When Task Time Arrives
- ✅ Browser notification (at exact time)
- ✅ Email reminder (if configured)  
- Example: "⏰ Task Reminder - Wake up is due now!"

### If Task is Overdue
- ✅ Browser notification (shown on tasks page)
- Example: "Task is overdue, please complete it"

## 🔧 Files Modified/Created

### New Files:
- `email_notifications.py` - Email sending module
- `EMAIL_SETUP.md` - Setup guide for Gmail
- `.env` - Configuration file (updated with email settings)

### Modified Files:
- `app.py` - Added Flask-Mail initialization and scheduler
- `blueprints/tasks.py` - Added email confirmation on task creation
- `database.py` - Added email_sent column to track sent notifications
- `pyproject.toml` - Added flask-mail and apscheduler dependencies

### Updated Dependencies:
- `flask-mail>=0.9.1` - For sending emails
- `apscheduler>=3.10.0` - For background task scheduling

## 🚀 Quick Start

### Step 1: Get Your Gmail App Password
Follow the guide in `EMAIL_SETUP.md`:
1. Enable 2-Step Verification on your Google Account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Copy the 16-character password

### Step 2: Update .env File
Edit `.env` and add:
```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
ENABLE_EMAIL_NOTIFICATIONS=True
```

### Step 3: Restart the App
- Kill the Flask process (Ctrl+C)
- Start it again: `python app.py`

### Step 4: Allow Browser Notifications
- Browser will ask for notification permission
- Click "Allow" to enable browser notifications

## 📧 How Email Notifications Work

1. **Background Scheduler**: APScheduler runs every 60 seconds (configurable)
2. **Time Check**: When a task's scheduled time arrives, an email is sent
3. **Duplicate Prevention**: System tracks which emails have been sent using `email_sent` flag
4. **Smart Filtering**: 
   - Only sends for incomplete tasks
   - Only sends when task has a specific time
   - Only sends once per task

## 🎯 Example Scenarios

### Scenario 1: Task "Wake up" with time "5:49 AM"
- ✅ Browser notification when you add it
- ✅ Email confirmation immediately
- ✅ Email reminder at 5:49 AM
- ✅ Browser notification at 5:49 AM

### Scenario 2: Task "Study" with time "2:30 PM" (already past)
- ✅ Browser notification when you add it
- ✅ Email confirmation immediately
- ✅ Email reminder sent within 1 minute (next scheduler check)
- ✅ Browser shows as time_due notification

### Scenario 3: Task "Read" with NO specific time
- ✅ Browser notification when you add it
- ✅ Email confirmation immediately
- ✅ Browser notification as "day_reminder" if you visit tasks page
- ❌ No specific time email (only when time is set)

## ⚙️ Configuration Options

### Enable/Disable Email Notifications
In `.env`:
```
ENABLE_EMAIL_NOTIFICATIONS=True  # Turn on email notifications
ENABLE_EMAIL_NOTIFICATIONS=False # Turn off email notifications
```

### Scheduler Check Interval
In `app.py`, line 54:
```python
scheduler.add_job(check_and_send_task_emails, 'interval', minutes=1)
```
Change `minutes=1` to any value (e.g., `minutes=5` for every 5 minutes)

### Email Server Settings
In `.env`, you can also configure:
```
MAIL_SERVER=smtp.gmail.com        # SMTP server
MAIL_PORT=587                     # SMTP port
MAIL_USE_TLS=True                 # Use TLS encryption
```

## 🔍 How to Debug

### Check if emails are being sent:
1. Look at Flask console output
2. You'll see: "Email sent successfully to your-email@gmail.com for task 'Task Name'"

### If emails aren't sending:
1. Check `.env` file has correct Gmail credentials
2. Check 2-Step Verification is enabled
3. Check App Password is correct (16 characters)
4. Look for error messages in Flask console
5. Check spam/promotions folder in Gmail

### If scheduler isn't running:
1. Flask must be running (not in test mode)
2. Check for errors in console on startup
3. Task must have a specific time (not empty)

## 🔐 Security Notes

- **App Passwords are secure**: They only work for this app
- **Can be revoked**: Go to Google Account settings anytime
- **No password in code**: Everything is in `.env` (not in git)
- **Don't commit .env**: Add to `.gitignore`

## 📱 Browser Notifications

Browser notifications work independently of email:
- Always show when you're on the tasks page
- Show browser popup even if email fails
- Stored in localStorage to prevent duplicates
- Can be cleared by clearing browser cache

## 🎓 Technical Details

### Database Schema Changes
```sql
-- Added to tasks table:
email_sent INTEGER DEFAULT 0  -- Tracks if reminder email was sent
```

### Task Lifecycle
1. User creates task
2. Email confirmation sent (optional)
3. System marks: email_sent = 0 (not yet notified)
4. Scheduler checks every minute
5. When time >= task.time, email is sent
6. System marks: email_sent = 1 (notification sent)
7. Browser also shows notification

### API Endpoints
- `GET /tasks/notifications` - Returns tasks due for notifications
- `POST /tasks/add` - Creates task and sends confirmation email
- `POST /tasks/toggle/<id>` - Marks task as complete

---

**All set!** Your Daily Planner now has powerful email notifications combined with browser notifications for maximum reliability! 🎉
