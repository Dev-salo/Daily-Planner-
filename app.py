from flask import Flask
from flask_login import LoginManager
import os
from database import init_db
from models import User

from blueprints.main import main_bp
from blueprints.auth import auth_bp
from blueprints.tasks import tasks_bp
from blueprints.notes import notes_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'your-secret-key-here-change-in-production')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    return User.get(int(user_id))

init_db()

app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(tasks_bp)
app.register_blueprint(notes_bp)

@app.context_processor
def inject_cache_buster():
    return {'cache_buster': os.urandom(8).hex()}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
