from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///porterage.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    client_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

class Timesheet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify({'success': True, 'role': user.role, 'userId': user.id})
    return jsonify({'success': False}), 401

@app.route('/api/transactions', methods=['GET', 'POST'])
def handle_transactions():
    if request.method == 'POST':
        data = request.json
        new_transaction = Transaction(
            employee_id=1,  # Replace with actual employee ID from session
            client_name=data['clientName'],
            amount=float(data['amount']),
            description=data['description']
        )
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({'success': True})
    else:
        transactions = Transaction.query.all()
        return jsonify([{
            'employee': User.query.get(t.employee_id).username,
            'clientName': t.client_name,
            'amount': t.amount,
            'description': t.description,
            'date': t.date.isoformat()
        } for t in transactions])

@app.route('/api/timesheets', methods=['GET', 'POST'])
def handle_timesheets():
    if request.method == 'POST':
        data = request.json
        new_timesheet = Timesheet(
            employee_id=1,  # Replace with actual employee ID from session
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            start_time=datetime.strptime(data['startTime'], '%H:%M').time(),
            end_time=datetime.strptime(data['endTime'], '%H:%M').time()
        )
        db.session.add(new_timesheet)
        db.session.commit()
        return jsonify({'success': True})
    else:
        timesheets = Timesheet.query.all()
        return jsonify([{
            'employee': User.query.get(t.employee_id).username,
            'date': t.date.isoformat(),
            'startTime': t.start_time.isoformat(),
            'endTime': t.end_time.isoformat(),
            'totalHours': str(datetime.combine(t.date, t.end_time) - datetime.combine(t.date, t.start_time))
        } for t in timesheets])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create a test admin user if not exists
        if not User.query.filter_by(username='admin').first():
            admin_user = User(username='admin', password=generate_password_hash('admin123'), role='admin')
            db.session.add(admin_user)
            db.session.commit()
    app.run(debug=True)

if not User.query.filter_by(username='admin').first():
    admin_user = User(username='admin', password=generate_password_hash('admin123', method='sha256'), role='admin')
    db.session.add(admin_user)
    db.session.commit()