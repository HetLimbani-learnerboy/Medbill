from flask import Blueprint, request, jsonify
from app.models.user_model import User
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from email.message import EmailMessage
import smtplib
import os
import random

auth_bp = Blueprint('auth', __name__)

# Temporary OTP storage
otp_store = {}

@auth_bp.route('/api',methods=['GET'])
def api_home():
    return jsonify({
        "message": "Flask API is running successfully",
        "status": "OK"
    })

@auth_bp.route('/api/signup', methods=['POST'])
def register():

    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'message': 'All fields are required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 400

    new_user = User(
        username=name,
        email=email
    )

    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Database error', 'error': str(e)}), 500


# ---------------- SEND OTP ----------------
@auth_bp.route('/api/send-otp', methods=['POST'])
def send_otp():

    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    otp = random.randint(100000, 999999)

    otp_store[email] = otp

    EMAIL_USER = os.getenv('EMAIL_USER')
    EMAIL_PASS = os.getenv('EMAIL_PASS')
    EMAIL_FROM = os.getenv('EMAIL_FROM')

    try:

        msg = EmailMessage()
        msg['Subject'] = 'Your OTP Verification'
        msg['From'] = EMAIL_FROM
        msg['To'] = email
        msg.set_content(f'Your OTP is: {otp}. It is valid for 5 minutes.')

        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(msg)

        return jsonify({'message': 'OTP sent successfully'}), 200

    except Exception as e:
        return jsonify({'message': 'Failed to send OTP', 'error': str(e)}), 500


# ---------------- VERIFY OTP ----------------
@auth_bp.route('/api/verify-otp', methods=['POST'])
def verify_otp():

    data = request.get_json()

    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({'message': 'Email and OTP are required'}), 400

    # Check OTP
    if email in otp_store and str(otp_store[email]) == str(otp):

        # Find user in DB
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Update verification status
        user.is_verified = True

        try:
            db.session.commit()

            # remove OTP after success
            del otp_store[email]

            return jsonify({
                'message': 'OTP verified successfully',
                'is_verified': True
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({
                'message': 'Database error',
                'error': str(e)
            }), 500

    return jsonify({
        'message': 'Invalid OTP',
        'is_verified': False
    }), 400