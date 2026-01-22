import dotenv from 'dotenv';
import * as brevo from '@getbrevo/brevo';
import { generateOTPEmailHTML, getOTPEmailSubject, OTPEmailData } from '../templates/EmailOTP';
import { generateResetPasswordEmailHTML, getResetPasswordEmailSubject, ResetPasswordEmailData } from '../templates/reset-password';

dotenv.config();

/**
 * EmailSender class for sending emails via Brevo
 */
export class EmailSender {
  subject: string;
  htmlContent: string;
  sender: { email: string; name?: string };
  to: { email: string; name?: string }[];
  apiInstance: brevo.TransactionalEmailsApi;
  sendSmtpEmail: brevo.SendSmtpEmail;

  constructor({
    subject = '',
    htmlContent,
    sender,
    to,
  }: {
    subject: string;
    htmlContent: string;
    sender: { email: string; name?: string };
    to: { email: string; name?: string }[];
  }) {
    this.subject = subject;
    this.htmlContent = htmlContent;
    this.sender = sender;
    this.to = to;
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.sendSmtpEmail = new brevo.SendSmtpEmail();
    this.setApiKey();
  }

  setApiKey() {
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!,
    );
  }

  async send() {
    this.sendSmtpEmail.subject = this.subject;
    this.sendSmtpEmail.htmlContent = this.htmlContent;
    this.sendSmtpEmail.sender = {
      email: this.sender.email,
      name: this.sender.name,
    };
    this.sendSmtpEmail.to = this.to.map((recipient) => ({
      email: recipient.email,
      name: recipient.name,
    }));

    const data = await this.apiInstance.sendTransacEmail(this.sendSmtpEmail);
    return data;
  }
}

/**
 * Send OTP via Email using Brevo
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  fullName?: string
): Promise<boolean> => {
  try {
    const emailData: OTPEmailData = {
      otp,
      fullName,
    };

    const senderEmail = process.env.EMAIL_FROM || process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
    const senderName = process.env.EMAIL_SENDER_NAME || 'WMMS';

    if (!senderEmail) {
      console.error('Error: EMAIL_FROM, BREVO_SENDER_EMAIL, or EMAIL_USER must be set in environment variables');
      return false;
    }

    if (!process.env.BREVO_API_KEY) {
      console.error('Error: BREVO_API_KEY must be set in environment variables');
      return false;
    }

    const emailSender = new EmailSender({
      subject: getOTPEmailSubject(),
      htmlContent: generateOTPEmailHTML(emailData),
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [
        {
          email,
          name: fullName,
        },
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending OTP email to:', email);
      console.log('Subject:', getOTPEmailSubject());
    }

    await emailSender.send();
    console.log('OTP email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('Brevo API key is invalid or missing. Check BREVO_API_KEY environment variable.');
      } else if (error.message.includes('sender')) {
        console.error('Invalid sender email. Check EMAIL_FROM or BREVO_SENDER_EMAIL environment variable.');
      }
    }
    
    return false;
  }
};

/**
 * Send Password Reset Email using Brevo
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  fullName?: string
): Promise<boolean> => {
  try {
    // Construct reset URL
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const emailData: ResetPasswordEmailData = {
      resetUrl,
      fullName,
      validityMinutes: 10, // Token expires in 10 minutes
    };

    const senderEmail = process.env.EMAIL_FROM || process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER;
    const senderName = process.env.EMAIL_SENDER_NAME || 'WMMS';

    if (!senderEmail) {
      console.error('Error: EMAIL_FROM, BREVO_SENDER_EMAIL, or EMAIL_USER must be set in environment variables');
      return false;
    }

    if (!process.env.BREVO_API_KEY) {
      console.error('Error: BREVO_API_KEY must be set in environment variables');
      return false;
    }

    const emailSender = new EmailSender({
      subject: getResetPasswordEmailSubject(),
      htmlContent: generateResetPasswordEmailHTML(emailData),
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [
        {
          email,
          name: fullName,
        },
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending password reset email to:', email);
      console.log('Subject:', getResetPasswordEmailSubject());
      console.log('Reset URL:', resetUrl);
    }

    await emailSender.send();
    console.log('Password reset email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('Brevo API key is invalid or missing. Check BREVO_API_KEY environment variable.');
      } else if (error.message.includes('sender')) {
        console.error('Invalid sender email. Check EMAIL_FROM or BREVO_SENDER_EMAIL environment variable.');
      }
    }
    
    return false;
  }
};
