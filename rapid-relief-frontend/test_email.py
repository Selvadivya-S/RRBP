from flask import Flask
from flask_mail import Mail, Message

app = Flask(__name__)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'your_email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your_16_char_app_password'

mail = Mail(app)

with app.app_context():
    msg = Message(
        subject="Test Email",
        sender=app.config['MAIL_USERNAME'],
        recipients=["recipient_email@gmail.com"]
    )
    msg.body = "This is a test email from Flask."
    mail.send(msg)
    print("Email sent successfully!")
