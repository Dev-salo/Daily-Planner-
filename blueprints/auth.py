from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, Points
import re

auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        if not name or not email or not password:
            flash('All fields are required!', 'error')
            return render_template('register.html')
        
        if not is_valid_email(email):
            flash('Please enter a valid email address!', 'error')
            return render_template('register.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long!', 'error')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('Passwords do not match!', 'error')
            return render_template('register.html')
        
        if User.get_by_email(email):
            flash('Email already registered!', 'error')
            return render_template('register.html')
        
        password_hash = generate_password_hash(password)
        user = User.create(name, email, password_hash)
        
        # Initialize points for new user
        Points.initialize_for_user(user.id)
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False)
        
        if not email or not password:
            flash('Email and password are required!', 'error')
            return render_template('login.html')
        
        user = User.get_by_email(email)
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user, remember=bool(remember))
            flash(f'Welcome back, {user.name}!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('main.dashboard'))
        else:
            flash('Invalid email or password!', 'error')
            return render_template('login.html')
    
    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('main.home'))
