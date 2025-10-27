from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, send_file
from flask_login import login_required, current_user
from models import Task
from datetime import datetime
import csv
import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks')
@login_required
def tasks():
    user_tasks = Task.get_all_by_user(current_user.id)
    
    total_tasks = len(user_tasks)
    completed_tasks = sum(1 for task in user_tasks if task['status'] == 'complete')
    incomplete_tasks = total_tasks - completed_tasks
    completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    return render_template('tasks.html', 
                         tasks=user_tasks,
                         total=total_tasks,
                         completed=completed_tasks,
                         incomplete=incomplete_tasks,
                         percentage=round(completion_percentage, 1))

@tasks_bp.route('/tasks/add', methods=['POST'])
@login_required
def add_task():
    name = request.form.get('name', '').strip()
    description = request.form.get('description', '').strip()
    date = request.form.get('date', '')
    time = request.form.get('time', '')
    frequency = request.form.get('frequency', 'daily')
    
    if not name or not date:
        flash('Task name and date are required!', 'error')
        return redirect(url_for('tasks.tasks'))
    
    Task.create(current_user.id, name, description, date, time, frequency)
    flash('Task added successfully!', 'success')
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/tasks/update/<int:task_id>', methods=['POST'])
@login_required
def update_task(task_id):
    task = Task.get_by_id(task_id)
    
    if not task or task['user_id'] != current_user.id:
        flash('Task not found!', 'error')
        return redirect(url_for('tasks.tasks'))
    
    name = request.form.get('name', '').strip()
    description = request.form.get('description', '').strip()
    date = request.form.get('date', '')
    time = request.form.get('time', '')
    frequency = request.form.get('frequency', 'daily')
    status = request.form.get('status', 'incomplete')
    
    if not name or not date:
        flash('Task name and date are required!', 'error')
        return redirect(url_for('tasks.tasks'))
    
    Task.update(task_id, name, description, date, time, frequency, status)
    flash('Task updated successfully!', 'success')
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/tasks/delete/<int:task_id>', methods=['POST'])
@login_required
def delete_task(task_id):
    task = Task.get_by_id(task_id)
    
    if not task or task['user_id'] != current_user.id:
        flash('Task not found!', 'error')
        return redirect(url_for('tasks.tasks'))
    
    Task.delete(task_id)
    flash('Task deleted successfully!', 'success')
    return redirect(url_for('tasks.tasks'))

@tasks_bp.route('/tasks/toggle/<int:task_id>', methods=['POST'])
@login_required
def toggle_task(task_id):
    task = Task.get_by_id(task_id)
    
    if not task or task['user_id'] != current_user.id:
        return jsonify({'success': False, 'message': 'Task not found'}), 404
    
    new_status = 'complete' if task['status'] == 'incomplete' else 'incomplete'
    Task.update_status(task_id, new_status)
    
    return jsonify({'success': True, 'status': new_status})

@tasks_bp.route('/tasks/api')
@login_required
def tasks_api():
    user_tasks = Task.get_all_by_user(current_user.id)
    
    events = []
    for task in user_tasks:
        events.append({
            'id': task['id'],
            'title': task['name'],
            'start': f"{task['date']}T{task['time']}" if task['time'] else task['date'],
            'description': task['description'],
            'frequency': task['frequency'],
            'status': task['status'],
            'backgroundColor': '#28a745' if task['status'] == 'complete' else '#007bff'
        })
    
    return jsonify(events)

@tasks_bp.route('/export/csv')
@login_required
def export_csv():
    user_tasks = Task.get_all_by_user(current_user.id)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['Task Name', 'Description', 'Date', 'Time', 'Frequency', 'Status'])
    
    for task in user_tasks:
        writer.writerow([
            task['name'],
            task['description'] or '',
            task['date'],
            task['time'] or '',
            task['frequency'],
            task['status']
        ])
    
    output.seek(0)
    
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'tasks_{datetime.now().strftime("%Y%m%d")}.csv'
    )

@tasks_bp.route('/export/pdf')
@login_required
def export_pdf():
    user_tasks = Task.get_all_by_user(current_user.id)
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    title = Paragraph(f"<b>Task List - {current_user.name}</b>", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 0.2 * inch))
    
    subtitle = Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", styles['Normal'])
    elements.append(subtitle)
    elements.append(Spacer(1, 0.3 * inch))
    
    data = [['Task', 'Date', 'Time', 'Frequency', 'Status']]
    
    for task in user_tasks:
        data.append([
            task['name'][:30],
            task['date'],
            task['time'] or 'N/A',
            task['frequency'].capitalize(),
            task['status'].capitalize()
        ])
    
    table = Table(data, colWidths=[2.5*inch, 1.2*inch, 0.8*inch, 1*inch, 1*inch])
    
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'tasks_{datetime.now().strftime("%Y%m%d")}.pdf'
    )
