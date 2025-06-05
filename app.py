from flask import Flask, request, jsonify, render_template, url_for, redirect, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import io
import sys
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # החלף במפתח סודי משלך
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# מודל המשתמש
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)

@app.route("/")
def home():
    if 'user_id' not in session:
        return redirect(url_for('register'))
    
    return redirect(url_for('editor'))

@app.route("/ide")
def editor():
    if 'user_id' not in session:
        return redirect(url_for('register'))
    
    return render_template("editor.html")

@app.route("/exercises")
def exercises():
    if 'user_id' not in session:
        return redirect(url_for('register'))
    
    return render_template("index.html")


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # בודק אם המשתמש כבר קיים
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('User name already exists ', 'danger')
            return redirect(url_for('register'))


        try:
            hashed_password = generate_password_hash(password,  method='pbkdf2:sha256')
            new_user = User(username=username, password=hashed_password)

            db.session.add(new_user)
            db.session.commit()
            flash('Succesfully in! ', 'success')
            session['user_id'] = new_user.id
            return redirect(url_for('home'))
        
        except:
            flash('הייתה שגיאה במהלך ההרשמה, נסה שוב.', 'danger')
            return redirect(url_for('register'))

    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            # אם התחבר בהצלחה, מועבר לדף הבית של האתר
            flash('!התחברת בהצלחה', 'success')
            return redirect(url_for('home'))
        else:
            flash('שם משתמש או סיסמה שגויים.', 'danger')
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash('Dissconnected','info')
    return render_template('landing.html')


@app.route("/run", methods=["POST"])
def run_code():
    data = request.get_json()
    code = data.get("code", "")

    output = io.StringIO()
    try:
        sys.stdout = output
        exec(code, {})  # הרצת הקוד בסביבה מבודדת
    except Exception as e:
        print("שגיאה:", e)
    finally:
        sys.stdout = sys.__stdout__

    return jsonify({"output": output.getvalue()})

if __name__ == "__main__":
    # יצירת מסד נתונים אם לא קיים
    with app.app_context():
        db.create_all()

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
