#!/usr/bin/env python3
"""
Quick email configuration setup script
Run this to test your email configuration
"""

import os
import sys

def test_smtp_config():
    """Test SMTP configuration"""
    print("\n=== Testing SMTP Configuration ===")
    
    smtp_enabled = os.getenv("SMTP_ENABLED", "false").lower() == "true"
    smtp_server = os.getenv("SMTP_SERVER", "")
    smtp_username = os.getenv("SMTP_USERNAME", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    
    if not smtp_enabled:
        print("❌ SMTP is not enabled")
        print("   Set SMTP_ENABLED=true to enable")
        return False
    
    if not smtp_server:
        print("❌ SMTP_SERVER is not set")
        return False
    
    if not smtp_username:
        print("❌ SMTP_USERNAME is not set")
        return False
    
    if not smtp_password:
        print("❌ SMTP_PASSWORD is not set")
        return False
    
    print(f"✅ SMTP Server: {smtp_server}")
    print(f"✅ SMTP Username: {smtp_username}")
    print(f"✅ SMTP Password: {'*' * len(smtp_password)}")
    
    # Try to send a test email
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        test_email = input("\nEnter your email to send a test message: ").strip()
        
        if not test_email:
            print("No email provided, skipping test send")
            return True
        
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = test_email
        msg['Subject'] = "Test Email from Rapid Relief"
        msg.attach(MIMEText("This is a test email from Rapid Relief platform.", 'plain'))
        
        print(f"\nAttempting to send test email to {test_email}...")
        server = smtplib.SMTP(smtp_server, int(os.getenv("SMTP_PORT", "587")))
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, test_email, msg.as_string())
        server.quit()
        
        print("✅ Test email sent successfully!")
        print(f"   Please check {test_email} (including spam folder)")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send test email: {e}")
        print("\nCommon issues:")
        print("  - For Gmail: Make sure you're using an App Password, not your regular password")
        print("  - Check that 2-Step Verification is enabled")
        print("  - Verify SMTP_SERVER and SMTP_PORT are correct")
        return False

def test_sendgrid_config():
    """Test SendGrid configuration"""
    print("\n=== Testing SendGrid Configuration ===")
    
    api_key = os.getenv("SENDGRID_API_KEY", "")
    verified_sender = os.getenv("SENDGRID_VERIFIED_SENDER", "")
    
    if api_key == "YOUR_SENDGRID_API_KEY" or not api_key:
        print("❌ SENDGRID_API_KEY is not configured")
        return False
    
    if not verified_sender or verified_sender == "verified_sender@example.com":
        print("❌ SENDGRID_VERIFIED_SENDER is not configured")
        return False
    
    print(f"✅ SendGrid API Key: {'*' * 20}...{api_key[-4:]}")
    print(f"✅ Verified Sender: {verified_sender}")
    
    try:
        import sendgrid
        from sendgrid.helpers.mail import Mail
        
        sg = sendgrid.SendGridAPIClient(api_key=api_key)
        print("✅ SendGrid client initialized successfully")
        return True
    except ImportError:
        print("❌ SendGrid library not installed")
        print("   Run: pip install sendgrid")
        return False
    except Exception as e:
        print(f"❌ SendGrid initialization failed: {e}")
        return False

def main():
    print("=" * 50)
    print("Rapid Relief Email Configuration Test")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = os.path.join(os.path.dirname(__file__), "flask_app", ".env")
    if os.path.exists(env_file):
        print(f"\n✅ Found .env file at {env_file}")
        try:
            from dotenv import load_dotenv
            load_dotenv(env_file)
            print("✅ Loaded environment variables from .env")
        except ImportError:
            print("⚠️  python-dotenv not installed. Install with: pip install python-dotenv")
    else:
        print(f"\n⚠️  No .env file found at {env_file}")
        print("   Environment variables should be set manually or create a .env file")
    
    # Test configurations
    smtp_ok = test_smtp_config()
    sendgrid_ok = test_sendgrid_config()
    
    print("\n" + "=" * 50)
    if smtp_ok or sendgrid_ok:
        print("✅ Email configuration is ready!")
    else:
        print("❌ Email configuration is not set up")
        print("\nPlease configure either SMTP or SendGrid:")
        print("  See EMAIL_SETUP.md for detailed instructions")
    print("=" * 50)

if __name__ == "__main__":
    main()

