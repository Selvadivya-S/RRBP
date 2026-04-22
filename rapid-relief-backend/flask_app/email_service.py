import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail as SGMail
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

load_dotenv()

SMTP_ENABLED = os.getenv("SMTP_ENABLED", "true").lower() == "true"
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME)

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_VERIFIED_SENDER = os.getenv("SENDGRID_VERIFIED_SENDER")

sg = None
if SENDGRID_AVAILABLE and SENDGRID_API_KEY:
    try:
        sg = SendGridAPIClient(api_key=SENDGRID_API_KEY)
        print("✅ SendGrid initialized")
    except Exception as e:
        print(f"❌ SendGrid init failed: {e}")

def send_email(to_email, subject, body):
    errors = []

    # Try SendGrid first
    if sg:
        try:
            message = SGMail(
                from_email=SENDGRID_VERIFIED_SENDER,
                to_emails=to_email,
                subject=subject,
                plain_text_content=body
            )
            sg.send(message)
            return True, None
        except Exception as e:
            errors.append(f"SendGrid failed: {e}")

    # Fallback to SMTP
    if SMTP_ENABLED:
        try:
            msg = MIMEMultipart()
            msg['From'] = SMTP_FROM_EMAIL
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            if SMTP_USE_TLS:
                server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())
            server.quit()
            return True, None
        except Exception as e:
            errors.append(f"SMTP failed: {e}")

    return False, " | ".join(errors)
