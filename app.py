from flask import Flask, request, jsonify, render_template, url_for, redirect, flash
from models import *
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, AnonymousUserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import io, sys, os, ast
from dotenv import load_dotenv

load_dotenv(dotenv_path='env/.env')

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
db.init_app(app)

# Guest support
class Guest(AnonymousUserMixin):
    def __init__(self):
        self.username = "Guest"
        self.is_guest = True

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.anonymous_user = Guest

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Landing page
@app.route("/")
def root():
    return render_template("landing.html")

@app.route("/landing")
def landing():
    return render_template("landing.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/guest")
def guest_login():
    guest = Guest()
    login_user(guest, remember=False, force=True)
    flash("You are now browsing as a guest", "info")
    return redirect(url_for('home'))

# Code editor – available to all logged users including guest
@app.route("/ide")
def editor():
    return render_template("editor.html")

# Exercises – also allowed for guest
@app.route("/exercises")
def exercises():
    return render_template("index.html")

# Registration
@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']

        if len(username) < 3:
            flash('Username must be at least 3 characters.', 'danger')
            return redirect(url_for('register'))

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Username already exists.', 'danger')
            return redirect(url_for('register'))

        try:
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
            new_user = User(username=username, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()

            login_user(new_user)
            flash('Successfully registered and logged in!', 'success')
            return redirect(url_for('home'))

        except Exception as e:
            flash(f'Registration failed. Please try again. ({e})', 'danger')
            return redirect(url_for('register'))

    return render_template('register.html')

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('Successfully logged in!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password.', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')

# Logout
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for("landing"))

# Code execution
@app.route("/run", methods=["POST"])
def run_code():
    data = request.get_json()
    code = data.get("code", "")

    try:
        parsed_code = ast.parse(code, mode='exec')
        for node in ast.walk(parsed_code):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                return jsonify({"output": "❌ Import statements are not allowed."})
            if isinstance(node, ast.Call):
                func_name = getattr(node.func, 'id', '') or getattr(node.func, 'attr', '')
                if func_name in ["exec", "eval", "open", "compile", "input", "os", "subprocess"]:
                    return jsonify({"output": f"❌ Function '{func_name}' is restricted."})
    except Exception as e:
        return jsonify({"output": f"AST parsing error: {e}"})

    output = io.StringIO()
    try:
        sys.stdout = output
        exec(code, {})
    except Exception as e:
        print("Error:", e)
    finally:
        sys.stdout = sys.__stdout__

    return jsonify({"output": output.getvalue()})

# Start server
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
