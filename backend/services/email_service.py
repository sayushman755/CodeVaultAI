import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")


def send_otp_email(to_email: str, otp: str, name: str = "User"):
    subject = "Verify your CodeVault AI account"

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background:#f8fafc; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; padding:24px; border-radius:12px;">
          <h2 style="color:#0f172a;">CodeVault AI Email Verification</h2>
          <p>Hello {name},</p>
          <p>Your OTP for CodeVault AI signup verification is:</p>
          <h1 style="letter-spacing:6px; color:#0f172a;">{otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = SENDER_EMAIL
    message["To"] = to_email

    message.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, message.as_string())

    return True