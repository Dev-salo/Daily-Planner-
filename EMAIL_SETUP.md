# Email Notification Setup Guide

Your Daily Planner now supports email notifications! When you add a task with a specific time, you'll receive:
1. **Instant confirmation email** when the task is added
2. **Reminder email** at the exact time the task is due

## 🔧 Setting Up Gmail Email Notifications

### Step 1: Enable 2-Step Verification (Required)

1. Go to your [Google Account](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Find "2-Step Verification" and click on it
4. Follow the steps to enable 2-Step Verification

### Step 2: Generate an App Password

1. Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Copy this password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update Your .env File

Edit the `.env` file in your project root and update these lines:

```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

**Example:**
```
MAIL_USERNAME=john.doe@gmail.com
MAIL_PASSWORD=vwxyzabcd efghijkl
MAIL_DEFAULT_SENDER=john.doe@gmail.com
```

⚠️ **Important:** 
- Use the 16-character app password, NOT your regular Gmail password
- You can ignore spaces in the app password when pasting

### Step 4: Test the Setup

1. Restart your Flask application
2. Add a new task with a specific date and time
3. You should receive a confirmation email
4. When the task time arrives, you'll get a reminder email

## 📧 What Emails You'll Receive

### Task Added Confirmation
When you create a task, you'll immediately get a confirmation email showing:
- Task name
- Scheduled date and time
- Confirmation that reminders will be sent

### Task Due Reminder
When the task's scheduled time arrives, you'll get a reminder email:
- Task name and details
- Date and time
- Link to your Daily Planner

### Task Overdue Alert (Browser Only)
If a task date passes without completion, you'll see a browser notification (email reminders are sent at the task's scheduled time only)

## 🔐 Security Notes

- **App Passwords are secure**: They only work for this app and can be revoked individually
- **Regular passwords won't work**: Gmail requires App Passwords for third-party apps
- **Revoke anytime**: You can revoke the app password from your Google Account settings

## ⚙️ Toggle Notifications

To disable email notifications, change in your `.env` file:
```
ENABLE_EMAIL_NOTIFICATIONS=False
```

You can always turn it back on by setting it to `True`.

## 🆘 Troubleshooting

### Not receiving emails?

1. **Check your .env file**
   - Verify the Gmail address and app password are correct
   - No extra spaces or line breaks

2. **Check Gmail settings**
   - Make sure 2-Step Verification is enabled
   - App password was generated correctly

3. **Check spam folder**
   - Emails might be in spam initially

4. **Enable "Less secure apps"** (Alternative Method)
   - If app passwords aren't working, try enabling "Less secure apps":
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Scroll down to "Less secure apps"
   - Turn on "Allow less secure apps"
   - Then use your regular Gmail password in .env

5. **Check Flask logs**
   - Look at the console output when running the app
   - Error messages might show what's wrong

## 📱 Browser Notifications Still Work

Even if email is disabled or not configured, you'll still get:
- Browser popup notifications when adding tasks
- Browser reminders at task time
- Just make sure to allow notifications in your browser

---

**Questions?** Check the .env file or the email_notifications.py file in your project for more details.
