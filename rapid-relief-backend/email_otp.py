import random
from flask_mail import Message

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp(mail, email, otp):
    msg = Message(
        subject="Rapid Relief OTP Verification",
        sender="Rapid Relief",
        recipients=[email],
        body=f"Your OTP is {otp}"
    )
    mail.send(msg)
