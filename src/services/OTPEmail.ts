import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateOTPEmailHTML, generateOTPEmailText, getOTPEmailSubject, OTPEmailData } from '../templates/EmailOTP';

dotenv.config();

// Check if email credentials are configured
const isEmailConfigured = () => {
  return !!(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  );
};

// Create transporter only if credentials are available
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('⚠️  Email credentials not configured. Email sending will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: process.env.EMAIL_PORT === '465' || process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
    connectionTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false, // Allow self-signed certificates
    },
    debug: process.env.NODE_ENV !== 'production',
  });
};

const transporter = createTransporter();

export const sendMail = async (
  mailOptions: nodemailer.SendMailOptions
): Promise<nodemailer.SentMessageInfo> => {
  // If email is not configured, log to console (development mode)
  if (!transporter || !isEmailConfigured()) {
    console.log('\n=== EMAIL (CONSOLE MODE - Email not configured) ===');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    if (mailOptions.text) {
      console.log('Text:', mailOptions.text);
    }
    console.log('==================================================\n');
    
    // Return a mock success response
    return {
      messageId: `console-${Date.now()}`,
      accepted: [mailOptions.to as string],
      rejected: [],
      pending: [],
      response: '250 Message accepted (console mode)',
    } as nodemailer.SentMessageInfo;
  }

  try {
    // Verify connection before sending
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending email to:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Missing credentials')) {
        throw new Error('Email credentials are missing. Please check EMAIL_USER and EMAIL_PASS in .env file');
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error(`Cannot connect to SMTP server. Please check EMAIL_HOST (${process.env.EMAIL_HOST}) and EMAIL_PORT in .env file`);
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

process.on('SIGINT', () => {
  console.log('Shutting down mail transporter...');
  if (transporter) {
    transporter.close();
  }
  process.exit(0);
});

