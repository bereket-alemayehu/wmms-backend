import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateOTPEmailHTML, generateOTPEmailText, getOTPEmailSubject, OTPEmailData } from '../templates/EmailOTP';
import { generateResetPasswordEmailHTML, generateResetPasswordEmailText, getResetPasswordEmailSubject, ResetPasswordEmailData } from '../templates/reset-password';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: parseInt(process.env.EMAIL_PORT || '587') === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  connectionTimeout: 30000, // Increased to 30 seconds
  socketTimeout: 30000, // Increased to 30 seconds
  tls: {
    ciphers: 'SSLv3',
  },
  debug: process.env.NODE_ENV !== 'production',
});

export const sendMail = async (
  mailOptions: nodemailer.SendMailOptions
): Promise<nodemailer.SentMessageInfo> => {
  try {
    await transporter.verify();

    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending email to:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('ETIMEDOUT') || error.message.includes('Connection timeout')) {
        throw new Error(
          `Connection timeout to SMTP server. Please check:\n` +
          `- EMAIL_HOST: ${process.env.EMAIL_HOST}\n` +
          `- EMAIL_PORT: ${process.env.EMAIL_PORT || '587'}\n` +
          `- Network connectivity and firewall settings\n` +
          `- If running on a server, ensure outbound SMTP ports are open`
        );
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error(`Connection refused. Check EMAIL_HOST (${process.env.EMAIL_HOST}) and EMAIL_PORT`);
      } else if (error.message.includes('EAUTH')) {
        throw new Error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS credentials');
      }
    }
    
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Send OTP via Email
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

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: getOTPEmailSubject(),
      text: generateOTPEmailText(emailData),
      html: generateOTPEmailHTML(emailData),
    };

    await sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

/**
 * Send Password Reset Email
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

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: getResetPasswordEmailSubject(),
      text: generateResetPasswordEmailText(emailData),
      html: generateResetPasswordEmailHTML(emailData),
    };

    await sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

process.on('SIGINT', () => {
  console.log('Shutting down mail transporter...');
  transporter.close();
  process.exit(0);
});