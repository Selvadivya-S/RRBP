from flask import Flask, request, jsonify, render_template, flash, redirect, url_for, session
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import re
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()
try:
    import sendgrid
    from sendgrid.helpers.mail import Mail as SGMail
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

# -------------------- Flask Setup --------------------
app = Flask(__name__)
app.secret_key = "your_secret_key"
CORS(app, supports_credentials=True)

# -------------------- MongoDB Setup --------------------
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["hospital_db"]
users = db["users"]
hospital_admins = db["hospital_admins"]

# Ensure unique emails
users.create_index("email", unique=True)
hospital_admins.create_index("email", unique=True)

# -------------------- Email Configuration --------------------
# Option 1: SendGrid (if configured)
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
SENDGRID_VERIFIED_SENDER = os.getenv("selvadivya870@gmail.com", "selvadivya870@gmail.com")

# Option 2: SMTP (Gmail, Outlook, etc.) - Easier to set up
SMTP_ENABLED = os.getenv("SMTP_ENABLED", "true").lower() == "true"
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")  # Your email
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # Your app password
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USERNAME)

# Validate email configuration
def validate_email_config():
    """Validate email configuration and return status"""
    issues = []
    
    if SMTP_ENABLED:
        if not SMTP_USERNAME:
            issues.append("SMTP_USERNAME is not set in .env file")
        if not SMTP_PASSWORD:
            issues.append("SMTP_PASSWORD is not set in .env file")
        if not SMTP_FROM_EMAIL:
            issues.append("SMTP_FROM_EMAIL is not set in .env file")
        if SMTP_USERNAME and "@" not in SMTP_USERNAME:
            issues.append("SMTP_USERNAME appears to be invalid (missing @)")
    
    if not SMTP_ENABLED and SENDGRID_API_KEY == "YOUR_SENDGRID_API_KEY":
        issues.append("Neither SMTP nor SendGrid is configured")
    
    return issues

# Print email configuration status on startup
print("\n" + "="*50)
print("EMAIL CONFIGURATION STATUS")
print("="*50)
print(f"SMTP Enabled: {SMTP_ENABLED}")
print(f"SMTP Server: {SMTP_SERVER}")
print(f"SMTP Port: {SMTP_PORT}")
print(f"SMTP Username: {SMTP_USERNAME if SMTP_USERNAME else '❌ NOT SET'}")
print(f"SMTP Password: {'✅ SET' if SMTP_PASSWORD else '❌ NOT SET'}")
print(f"SMTP From Email: {SMTP_FROM_EMAIL if SMTP_FROM_EMAIL else '❌ NOT SET'}")
print(f"SendGrid API Key: {'✅ SET' if SENDGRID_API_KEY != 'YOUR_SENDGRID_API_KEY' else '❌ NOT SET'}")
print(f"SendGrid Sender: {SENDGRID_VERIFIED_SENDER if SENDGRID_VERIFIED_SENDER != 'verified_sender@example.com' else '❌ NOT SET'}")

# Check for configuration issues
config_issues = validate_email_config()
if config_issues:
    print("\n⚠️  CONFIGURATION ISSUES:")
    for issue in config_issues:
        print(f"   - {issue}")
    print("\n📝 To fix:")
    print("   Option 1 (Recommended for Production):")
    print("   1. Sign up for SendGrid (FREE): https://signup.sendgrid.com/")
    print("   2. Get API Key from SendGrid dashboard")
    print("   3. Verify sender email in SendGrid")
    print("   4. Add SENDGRID_API_KEY and SENDGRID_VERIFIED_SENDER to .env")
    print("   5. Set SMTP_ENABLED=false in .env")
    print("   6. Restart the server")
    print("   See PRODUCTION_EMAIL_SETUP.md for detailed instructions")
    print("")
    print("   Option 2 (Alternative):")
    print("   1. Open rapid-relief-backend/flask_app/.env file")
    print("   2. Fill in SMTP_USERNAME, SMTP_PASSWORD, and SMTP_FROM_EMAIL")
    print("   3. For Gmail: Get App Password from https://myaccount.google.com/apppasswords")
    print("   4. Restart the server")
else:
    print("\n✅ Email configuration looks good!")
print("="*50 + "\n")

# Initialize SendGrid if available and configured
sg = None
if SENDGRID_AVAILABLE and SENDGRID_API_KEY != "YOUR_SENDGRID_API_KEY":
    try:
        sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
        print("SendGrid initialized successfully")
    except Exception as e:
        print(f"SendGrid initialization error: {e}")

def send_email_via_sendgrid(to_email, subject, body):
    """Send email using SendGrid"""
    if not sg:
        raise Exception("SendGrid not configured. Please set SENDGRID_API_KEY environment variable.")
    
    message = SGMail(
        from_email=SENDGRID_VERIFIED_SENDER,
        to_emails=to_email,
        subject=subject,
        plain_text_content=body
    )
    try:
        response = sg.send(message)
        print(f"SendGrid email sent to {to_email}, Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"SendGrid email error: {e}")
        raise

def send_email_via_smtp(to_email, subject, body):
    """Send email using SMTP (Gmail, Outlook, etc.)"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        raise Exception("SMTP not configured. Please set SMTP_USERNAME and SMTP_PASSWORD in .env file. See .env file for instructions.")
    
    if not SMTP_FROM_EMAIL:
        raise Exception("SMTP_FROM_EMAIL not set. Please set it in .env file.")
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', to_email):
            raise Exception(f"Invalid email address format: {to_email}")
        
        # Connect to server and send
        print(f"[EMAIL] Connecting to {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        server.set_debuglevel(0)  # Set to 1 for verbose debugging
        server.starttls()
        print(f"[EMAIL] Logging in as {SMTP_USERNAME}...")
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        print(f"[EMAIL] Sending email to {to_email}...")
        text = msg.as_string()
        server.sendmail(SMTP_FROM_EMAIL, to_email, text)
        server.quit()
        
        print(f"[EMAIL] ✅ SMTP email sent successfully to {to_email}")
        return True
    except smtplib.SMTPRecipientsRefused as e:
        error_msg = f"Recipient email address refused by server: {to_email}. Error: {str(e)}"
        print(f"[EMAIL] ❌ {error_msg}")
        raise Exception(error_msg)
    except smtplib.SMTPSenderRefused as e:
        error_msg = f"Sender email address refused by server: {SMTP_FROM_EMAIL}. Error: {str(e)}"
        print(f"[EMAIL] ❌ {error_msg}")
        raise Exception(error_msg)
    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"SMTP Authentication failed. For Gmail, make sure you're using an App Password (not regular password). Get it from https://myaccount.google.com/apppasswords. Error: {str(e)}"
        print(f"[EMAIL] ❌ {error_msg}")
        raise Exception(error_msg)
    except smtplib.SMTPConnectError as e:
        error_msg = f"Could not connect to SMTP server {SMTP_SERVER}:{SMTP_PORT}. Check your internet connection and firewall settings. Error: {str(e)}"
        print(f"[EMAIL] ❌ {error_msg}")
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"SMTP error: {str(e)}"
        print(f"[EMAIL] ❌ {error_msg}")
        raise Exception(error_msg)

def send_email(to_email, subject, body):
    """Send email using available method (SendGrid preferred for production, fallback to SMTP)"""
    print(f"\n[EMAIL] Attempting to send email to: {to_email}")
    print(f"[EMAIL] Subject: {subject}")
    print(f"[EMAIL] SendGrid available: {sg is not None}")
    print(f"[EMAIL] SMTP_ENABLED: {SMTP_ENABLED}")
    print(f"[EMAIL] SMTP_USERNAME: {SMTP_USERNAME if SMTP_USERNAME else 'NOT SET'}")
    print(f"[EMAIL] SMTP_PASSWORD: {'SET' if SMTP_PASSWORD else 'NOT SET'}")
    
    errors = []
    
    # Try SendGrid first (better for production, no App Password needed)
    if sg:
        try:
            print(f"[EMAIL] Trying SendGrid (recommended for production)...")
            send_email_via_sendgrid(to_email, subject, body)
            print(f"[EMAIL] ✅ SendGrid email sent successfully!")
            return True, None
        except Exception as e:
            error_msg = f"SendGrid failed: {str(e)}"
            errors.append(error_msg)
            print(f"[EMAIL] ❌ {error_msg}")
            if SMTP_ENABLED:
                print(f"[EMAIL] Trying SMTP as fallback...")
    
    # Try SMTP as fallback
    if SMTP_ENABLED:
        try:
            print(f"[EMAIL] Trying SMTP...")
            send_email_via_smtp(to_email, subject, body)
            print(f"[EMAIL] ✅ SMTP email sent successfully!")
            return True, None
        except Exception as e:
            error_msg = f"SMTP failed: {str(e)}"
            errors.append(error_msg)
            print(f"[EMAIL] ❌ {error_msg}")
    
    # Both failed
    error_msg = "Email sending failed. " + " | ".join(errors)
    if not SMTP_ENABLED and not sg:
        error_msg += " Please configure SendGrid (recommended) or SMTP in .env file. See PRODUCTION_EMAIL_SETUP.md for details."
    print(f"[EMAIL] ❌ {error_msg}")
    return False, error_msg

# -------------------- API HOME --------------------
@app.route("/")
def home():
    return jsonify({"message": "Rapid Relief Backend Running"})

# ==================================================
# ✅ Patient / Donor Registration (API)
# ==================================================
@app.route("/api/register", methods=["POST", "OPTIONS"])
@cross_origin()
def api_register():
    if request.method == "OPTIONS":
        return jsonify({"status": "OK"}), 200

    try:
        data = request.get_json()
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        phone = data.get("phone", "")
        age = data.get("age", "")
        gender = data.get("gender", "")
        blood_group = data.get("bloodGroup", "")
        city = data.get("city", "")

        if not name or not email or not password:
            return jsonify({"success": False, "message": "Required fields missing"}), 400

        if users.find_one({"email": email}):
            return jsonify({"success": False, "message": "Email already registered"}), 409

        users.insert_one({
            "name": name,
            "email": email,
            "password": generate_password_hash(password),
            "phone": phone,
            "age": age,
            "gender": gender,
            "bloodGroup": blood_group,
            "city": city,
            "role": "Donor"
        })

        email_body = f"""
Hello {name},

Thank you for registering with Rapid Relief ❤️

Your registration was successful.

Blood Group: {blood_group or 'N/A'}
City: {city or 'N/A'}

Together, we save lives.

– Rapid Relief Team
"""
        print(f"\n[REGISTRATION] Sending welcome email to: {email}")
        success, error = send_email(email, "🎉 Rapid Relief Registration Successful", email_body)
        if not success:
            print(f"[REGISTRATION] ⚠️ Warning: Failed to send registration email to {email}: {error}")
            print(f"[REGISTRATION] ⚠️ User registered successfully but email notification failed")
            # Still return success since registration worked
            return jsonify({
                "success": True, 
                "message": "Registration successful! (Email notification failed - please check email configuration)"
            }), 201
        else:
            print(f"[REGISTRATION] ✅ Registration email sent successfully to {email}")

        return jsonify({"success": True, "message": "Registration successful! Check your email."}), 201

    except Exception as e:
        print("API REGISTER ERROR:", e)
        return jsonify({"success": False, "message": "Server error"}), 500

# ==================================================
# ✅ HTML Registration Form
# ==================================================
@app.route("/register", methods=["GET", "POST"])
def register_page():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        password = request.form.get("password")
        phone = request.form.get("phone", "")
        age = request.form.get("age", "")
        gender = request.form.get("gender", "")
        blood_group = request.form.get("bloodGroup", "")
        city = request.form.get("city", "")

        if not name or not email or not password:
            flash("Please fill all required fields", "danger")
            return render_template("register.html")

        if users.find_one({"email": email}):
            flash("Email already registered", "danger")
            return render_template("register.html")

        users.insert_one({
            "name": name,
            "email": email,
            "password": generate_password_hash(password),
            "phone": phone,
            "age": age,
            "gender": gender,
            "bloodGroup": blood_group,
            "city": city,
            "role": "Donor"
        })

        email_body = f"""
Hello {name},

Thank you for registering with Rapid Relief ❤️

Your registration was successful.

Blood Group: {blood_group or 'N/A'}
City: {city or 'N/A'}

Together, we save lives.

– Rapid Relief Team
"""
        print(f"\n[REGISTRATION] Sending welcome email to: {email}")
        success, error = send_email(email, "🎉 Rapid Relief Registration Successful", email_body)
        if not success:
            print(f"[REGISTRATION] ⚠️ Warning: Failed to send registration email to {email}: {error}")
            flash("Registration successful! (Email notification failed - please check email configuration)", "warning")
        else:
            print(f"[REGISTRATION] ✅ Registration email sent successfully to {email}")
            flash("Registration successful! Check your email.", "success")

        return redirect(url_for("register_page"))

    return render_template("register.html")

 

# ==================================================
# ✅ Hospital Admin Registration & Login
# ==================================================
@app.route("/admin/register", methods=["POST"])
def register_admin():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"success": False, "message": "Invalid email address"}), 400

    if hospital_admins.find_one({"email": email}):
        return jsonify({"success": False, "message": "Email already registered"}), 400

    hashed_password = generate_password_hash(password)

    hospital_admins.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"success": True, "message": "Hospital admin registered successfully"}), 201

# -------------------- Admin Login Page --------------------
@app.route("/admin/login", methods=["GET"])
def admin_login_page():
    return render_template("admin_login.html")

# -------------------- Admin Login POST for HTML Form --------------------
@app.route("/admin/login", methods=["POST"])
def admin_login():
    if request.is_json:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        admin = hospital_admins.find_one({"email": email})
        if not admin:
            return jsonify({"success": False, "message": "Login failed: Email not found"}), 401

        if not check_password_hash(admin["password"], password):
            return jsonify({"success": False, "message": "Login failed: Incorrect password"}), 401

        # Set session for admin
        session["admin_email"] = admin["email"]
        session["admin_name"] = admin["name"]
        session["admin_logged_in"] = True

        return jsonify({
            "success": True,
            "message": "Login successful",
            "admin": {"name": admin["name"], "email": admin["email"]}
        }), 200

    else:
        email = request.form.get("email")
        password = request.form.get("password")

        admin = hospital_admins.find_one({"email": email})
        if not admin:
            flash("Login failed: Email not found", "danger")
            return render_template("admin_login.html")

        if not check_password_hash(admin["password"], password):
            flash("Login failed: Incorrect password", "danger")
            return render_template("admin_login.html")

        flash(f"Welcome {admin['name']}", "success")
        return f"Welcome {admin['name']}"

# ==================================================
# ✅ Admin Check Session Endpoint
# ==================================================
@app.route("/admin/check_session", methods=["GET"])
def admin_check_session():
    try:
        if session.get("admin_logged_in"):
            return jsonify({
                "logged_in": True,
                "admin": {
                    "email": session.get("admin_email"),
                    "name": session.get("admin_name")
                }
            }), 200
        else:
            return jsonify({"logged_in": False}), 200
    except Exception as e:
        return jsonify({"logged_in": False, "error": str(e)}), 200

# ==================================================
# ✅ Admin Logout Endpoint
# ==================================================
@app.route("/admin/logout", methods=["POST"])
def admin_logout():
    try:
        session.clear()
        return jsonify({"success": True, "message": "Logged out successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================================================
# ✅ Admin Route to List All Users (Fix 404)
# ==================================================
@app.route("/admin/users")
def admin_users():
    try:
        users_list = list(users.find({}, {"_id": 0, "password": 0}))
        return jsonify({"success": True, "users": users_list}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
# ==================================================
# ✅ Admin Send Alerts Endpoint
# ==================================================
@app.route("/admin/send_alerts", methods=["POST"])
def admin_send_alerts():
    try:
        data = request.get_json()
        emails = data.get("emails", [])
        
        print(f"\n[ALERTS] Received request to send alerts to {len(emails)} user(s)")
        
        if not emails:
            return jsonify({"status": "error", "message": "No emails provided"}), 400
        
        # Validate email addresses
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        valid_emails = []
        invalid_emails = []
        
        for email in emails:
            if email and email_pattern.match(email):
                valid_emails.append(email)
            else:
                invalid_emails.append(email)
                print(f"[ALERTS] ⚠️ Invalid email format: {email}")
        
        if invalid_emails:
            print(f"[ALERTS] ⚠️ Found {len(invalid_emails)} invalid email(s)")
        
        if not valid_emails:
            return jsonify({
                "status": "error",
                "message": "No valid email addresses provided",
                "invalid_emails": invalid_emails
            }), 400
        
        sent_to = []
        failed = []
        
        # Email body
        body = """⚠️ IMPORTANT ALERT FROM HOSPITAL ADMIN ⚠️

This is an important alert from your hospital admin.

Please check your account or contact the hospital for more information.

Thank you,
Rapid Relief Team"""
        
        print(f"[ALERTS] Starting to send emails to {len(valid_emails)} valid recipient(s)...")
        
        # Send emails one by one
        for idx, email in enumerate(valid_emails, 1):
            print(f"\n[ALERTS] [{idx}/{len(valid_emails)}] Processing: {email}")
            try:
                success, error = send_email(email, "Hospital Admin Alert", body)
                
                if success:
                    sent_to.append(email)
                    print(f"[ALERTS] ✅ Successfully sent to: {email}")
                else:
                    failed.append({"email": email, "error": error or "Unknown error"})
                    print(f"[ALERTS] ❌ Failed to send to: {email} - {error}")
            except Exception as e:
                error_msg = str(e)
                failed.append({"email": email, "error": error_msg})
                print(f"[ALERTS] ❌ Exception sending to {email}: {error_msg}")
        
        # Prepare response
        print(f"\n[ALERTS] Summary: {len(sent_to)} sent, {len(failed)} failed, {len(invalid_emails)} invalid")
        
        if sent_to:
            response = {
                "status": "success" if not failed else "partial",
                "sent_to": sent_to,
                "message": f"Alerts sent to {len(sent_to)} user(s)"
            }
            if failed:
                response["failed"] = failed
                response["message"] += f", {len(failed)} failed"
            if invalid_emails:
                response["invalid_emails"] = invalid_emails
                response["message"] += f", {len(invalid_emails)} invalid email(s) skipped"
            return jsonify(response), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to send alerts to all recipients",
                "failed": failed,
                "invalid_emails": invalid_emails if invalid_emails else None
            }), 500
            
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(f"[ALERTS] ❌ {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": error_msg}), 500

# ==================================================
# ✅ Admin Dashboard Page Route
# ==================================================
@app.route("/admin/dashboard")
def admin_dashboard():
    try:
        users_list = list(users.find({}, {"_id": 0, "password": 0}))
        return render_template("dashboard.html", users=users_list)
    except Exception as e:
        return f"Error loading dashboard: {str(e)}"

# ==================================================
# ✅ Test Email Endpoint (for debugging)
# ==================================================
@app.route("/admin/test_email", methods=["POST"])
def test_email():
    """Test endpoint to send a test email"""
    try:
        data = request.get_json()
        test_email = data.get("email")
        
        if not test_email:
            return jsonify({"status": "error", "message": "Email address required"}), 400
        
        subject = "Test Email from Rapid Relief"
        body = """This is a test email from Rapid Relief platform.

If you received this email, your email configuration is working correctly!

Thank you,
Rapid Relief Team"""
        
        success, error = send_email(test_email, subject, body)
        
        if success:
            return jsonify({
                "status": "success",
                "message": f"Test email sent successfully to {test_email}",
                "note": "Please check your inbox (and spam folder)"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to send test email",
                "error": error,
                "help": "Check the console logs for detailed error information"
            }), 500
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# -------------------- Run Flask --------------------
if __name__ == "__main__":
    app.run(debug=True)
