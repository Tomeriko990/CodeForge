from flask import Flask, request, jsonify, render_template, url_for, redirect, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import io
import sys
import os
import ast

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # החלף במפתח סודי משלך
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# 🔐 Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # אם לא מחובר, יפנה ל-login

# 🧑 מודל המשתמש עם UserMixin
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)

# טוען את המשתמש לפי ה־id שלו
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# 🏠 דף הבית
@app.route("/")
def home():
    if current_user.is_authenticated:
        return redirect(url_for('editor'))
    return render_template("landing.html")

# עורך הקוד (רק למשתמשים מחוברים)
@app.route("/ide")
@login_required
def editor():
    return render_template("editor.html")

@app.route("/exercises")
@login_required
def exercises():
    return render_template("index.html")

# הרשמה
@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('home'))

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('User name already exists ', 'danger')
            return redirect(url_for('register'))

        try:
            hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
            new_user = User(username=username, password=hashed_password)

            db.session.add(new_user)
            db.session.commit()

            login_user(new_user)  # ⬅️ התחברות אוטומטית
            flash('Succesfully registered and logged in! ', 'success')
            return redirect(url_for('home'))

        except:
            flash('הייתה שגיאה במהלך ההרשמה, נסה שוב.', 'danger')
            return redirect(url_for('register'))

    return render_template('register.html')

# התחברות
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
            flash('!התחברת בהצלחה', 'success')
            return redirect(url_for('home'))
        else:
            flash('שם משתמש או סיסמה שגויים.', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')

# התנתקות
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('התנתקת מהמערכת', 'info')
    return redirect(url_for('landing'))

# הרצת קוד
@app.route("/run", methods=["POST"])
@login_required
def run_code():
    data = request.get_json()
    code = data.get("code", "")

    try:
        parsed_code = ast.parse(code, mode='exec')
        for node in ast.walk(parsed_code):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                return jsonify({"output": "❌ אסור להשתמש ב-import בקוד הזה."})
            if isinstance(node, ast.Call):
                func_name = getattr(node.func, 'id', '') or getattr(node.func, 'attr', '')
                if func_name in ["exec", "eval", "open", "compile", "input", "os", "subprocess"]:
                    return jsonify({"output": f"❌ הפונקציה {func_name} חסומה משיקולי אבטחה."})

    except Exception as e:
        return jsonify({"output": f"שגיאת ניתוח AST: {e}"})

    output = io.StringIO()
    try:
        sys.stdout = output
        exec(code, {})
    except Exception as e:
        print("שגיאה:", e)
    finally:
        sys.stdout = sys.__stdout__

    return jsonify({"output": output.getvalue()})

# הרצת השרת
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
