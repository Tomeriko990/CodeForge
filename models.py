# models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, AnonymousUserMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(150), nullable=False)

class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(), nullable=False, unique=True)
    output = db.Column(db.String(150), nullable=False)

# Guest user class
class Guest(AnonymousUserMixin):
    def __init__(self):
        self.username = "Guest"
        self.is_guest = True