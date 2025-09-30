const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter
const createTransporter = () => {
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = port === 465; // 465 uses implicit TLS; 587 uses STARTTLS

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Improve reliability in PaaS environments
    requireTLS: !secure,
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: {
      servername: process.env.EMAIL_HOST || 'smtp.gmail.com',
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });
};

// Generate magic link token
const generateMagicLinkToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send magic link email
const sendMagicLink = async (email, token, name) => {
  try {
    const transporter = createTransporter();
    // Fail fast if server not reachable or TLS/auth issues
    try {
      await transporter.verify();
    } catch (verifyErr) {
      console.warn('SMTP verify failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
    }
    const magicLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Login to Resume Review Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Resume Review Platform</h2>
          <p>Hello ${name},</p>
          <p>Click the link below to login to your account:</p>
          <a href="${magicLink}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Login to Platform
          </a>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 15 minutes for security reasons.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this login, please ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Magic link email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending magic link email:', error);
    throw error;
  }
};

// Send notification email for resume status change
const sendStatusNotification = async (email, name, status, notes = '') => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      'approved': 'Congratulations! Your resume has been approved.',
      'needs_revision': 'Your resume needs some revisions before approval.',
      'rejected': 'Unfortunately, your resume has been rejected.',
      'under_review': 'Your resume is currently under review.'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Resume Status Update: ${status.replace('_', ' ').toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Resume Status Update</h2>
          <p>Hello ${name},</p>
          <p>${statusMessages[status] || 'Your resume status has been updated.'}</p>
          ${notes ? `<p><strong>Review Notes:</strong> ${notes}</p>` : ''}
          <p>You can view your resume status by logging into the platform.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            View Dashboard
          </a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Status notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending status notification email:', error);
    throw error;
  }
};

module.exports = {
  generateMagicLinkToken,
  sendMagicLink,
  sendStatusNotification
};
