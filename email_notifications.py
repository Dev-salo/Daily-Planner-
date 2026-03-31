"""
Email notification module for sending task reminders via email
"""
from flask_mail import Mail, Message
from flask import current_app
from datetime import datetime
from models import NotificationTracker
import os

mail = Mail()

def init_mail(app):
    """Initialize Flask-Mail with app configuration"""
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')
    
    mail.init_app(app)

def should_send_email_notifications():
    """Check if email notifications are enabled"""
    return os.environ.get('ENABLE_EMAIL_NOTIFICATIONS', 'True') == 'True'

def send_task_reminder_email(user_email, user_name, task_name, task_time, task_date, task_id, user_id, task_description='', notification_type='silent'):
    """
    Send task reminder email to user (only once per task per day)
    
    Args:
        user_email: User's email address
        user_name: User's name
        task_name: Name of the task
        task_time: Time of the task (HH:MM format)
        task_date: Date of the task (YYYY-MM-DD format)
        task_id: ID of the task (for preventing duplicates)
        user_id: ID of the user (for notification tracking)
        task_description: Optional task description
        notification_type: Type of notification ('silent', 'bell', 'alarm')
    """
    if not should_send_email_notifications():
        return False
    
    if not user_email or not os.environ.get('MAIL_USERNAME'):
        print(f"Skipping email: missing user_email or mail config")
        return False
    
    # Check if notification was already sent for this task today
    if NotificationTracker.has_notification_been_sent(user_id, task_id, task_date):
        print(f"Notification already sent for task {task_id} on {task_date}")
        return False
    
    try:
        subject = f"⏰ Task Reminder: {task_name}"
        
        # Format the time and date nicely
        time_text = f"at {task_time}" if task_time else "No specific time"
        date_obj = datetime.strptime(task_date, '%Y-%m-%d')
        date_text = date_obj.strftime('%A, %B %d, %Y')
        
        # Notification type icon and text
        notification_icons = {
            'silent': '🔇 (Silent)',
            'bell': '🔔 (Bell)',
            'alarm': '🔊 (Alarm)'
        }
        notification_text = notification_icons.get(notification_type, '🔇 (Silent)')
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
                    <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h2 style="margin: 0;">📋 Task Reminder</h2>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px;">
                        <p>Hi <strong>{user_name}</strong>,</p>
                        
                        <p>This is a reminder that your task is due now:</p>
                        
                        <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; border-radius: 5px;">
                            <h3 style="margin-top: 0; color: #007bff;">{task_name}</h3>
                            <p style="margin: 5px 0;"><strong>Date:</strong> {date_text}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> {time_text}</p>
                            <p style="margin: 5px 0;"><strong>Notification Type:</strong> {notification_text}</p>
                            {f'<p style="margin: 5px 0;"><strong>Details:</strong> {task_description}</p>' if task_description else ''}
                        </div>
                        
                        <p style="color: #dc3545; font-weight: bold;">Please complete this task now!</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://your-domain.com/tasks" style="background-color: #007bff; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">View Tasks</a>
                        </div>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 12px;">
                            This is an automated reminder from your Daily Planner application. 
                            You can disable email notifications in your settings.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Task Reminder: {task_name}
        
        Hi {user_name},
        
        Your task is due now:
        
        Task: {task_name}
        Date: {date_text}
        Time: {time_text}
        Notification Type: {notification_text}
        {f'Details: {task_description}' if task_description else ''}
        
        Please complete this task now!
        """
        
        msg = Message(
            subject=subject,
            recipients=[user_email],
            html=html_body,
            body=text_body
        )
        
        mail.send(msg)
        
        # Mark notification as sent
        NotificationTracker.mark_notification_sent(user_id, task_id, task_date)
        print(f"Email notification sent to {user_email} for task '{task_name}' (Type: {notification_type})")
        return True
        
    except Exception as e:
        print(f"Error sending email to {user_email}: {str(e)}")
        return False

def send_task_added_confirmation_email(user_email, user_name, task_name, task_date, task_time=''):
    """
    Send confirmation email when task is added
    
    Args:
        user_email: User's email address
        user_name: User's name
        task_name: Name of the task
        task_date: Date of the task (YYYY-MM-DD format)
        task_time: Optional time of the task (HH:MM format)
    """
    if not should_send_email_notifications():
        return False
    
    if not user_email or not os.environ.get('MAIL_USERNAME'):
        return False
    
    try:
        subject = f"✅ Task Added: {task_name}"
        
        time_text = f"at {task_time}" if task_time else "with no specific time"
        date_obj = datetime.strptime(task_date, '%Y-%m-%d')
        date_text = date_obj.strftime('%A, %B %d, %Y')
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
                    <div style="background-color: #28a745; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h2 style="margin: 0;">✅ Task Added Successfully</h2>
                    </div>
                    
                    <div style="background-color: white; padding: 20px; border-radius: 0 0 10px 10px;">
                        <p>Hi <strong>{user_name}</strong>,</p>
                        
                        <p>Your task has been successfully added to your Daily Planner:</p>
                        
                        <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; border-radius: 5px;">
                            <h3 style="margin-top: 0; color: #28a745;">{task_name}</h3>
                            <p style="margin: 5px 0;"><strong>Scheduled for:</strong> {date_text} {time_text}</p>
                        </div>
                        
                        <p>You will receive a reminder notification when the task time arrives.</p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 12px;">
                            This is an automated confirmation from your Daily Planner application.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        text_body = f"""
        Task Added Successfully: {task_name}
        
        Hi {user_name},
        
        Your task has been added to your Daily Planner:
        
        Task: {task_name}
        Scheduled for: {date_text} {time_text}
        
        You will receive a reminder when the task time arrives.
        """
        
        msg = Message(
            subject=subject,
            recipients=[user_email],
            html=html_body,
            body=text_body
        )
        
        mail.send(msg)
        print(f"Task confirmation email sent to {user_email}")
        return True
        
    except Exception as e:
        print(f"Error sending confirmation email to {user_email}: {str(e)}")
        return False
