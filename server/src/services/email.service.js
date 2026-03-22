const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    logger.warn(`Email transport not configured. Skipping mail to ${to} with subject "${subject}".`);
    return { skipped: true };
  }

  await t.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
}

module.exports = { sendMail };
