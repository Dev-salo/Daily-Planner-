from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from models import Note

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/notes')
@login_required
def notes():
    user_notes = Note.get_all_by_user(current_user.id)
    return render_template('notes.html', notes=user_notes)

@notes_bp.route('/notes/add', methods=['POST'])
@login_required
def add_note():
    content = request.form.get('content', '').strip()
    
    if not content:
        flash('Note content cannot be empty!', 'error')
        return redirect(url_for('notes.notes'))
    
    Note.create(current_user.id, content)
    flash('Note created successfully!', 'success')
    return redirect(url_for('notes.notes'))

@notes_bp.route('/notes/update/<int:note_id>', methods=['POST'])
@login_required
def update_note(note_id):
    note = Note.get_by_id(note_id)
    
    if not note or note['user_id'] != current_user.id:
        flash('Note not found!', 'error')
        return redirect(url_for('notes.notes'))
    
    content = request.form.get('content', '').strip()
    
    if not content:
        flash('Note content cannot be empty!', 'error')
        return redirect(url_for('notes.notes'))
    
    Note.update(note_id, content)
    flash('Note updated successfully!', 'success')
    return redirect(url_for('notes.notes'))

@notes_bp.route('/notes/delete/<int:note_id>', methods=['POST'])
@login_required
def delete_note(note_id):
    note = Note.get_by_id(note_id)
    
    if not note or note['user_id'] != current_user.id:
        flash('Note not found!', 'error')
        return redirect(url_for('notes.notes'))
    
    Note.delete(note_id)
    flash('Note deleted successfully!', 'success')
    return redirect(url_for('notes.notes'))
