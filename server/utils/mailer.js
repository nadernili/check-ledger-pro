import nodemailer from 'nodemailer';

// If SMTP is not configured, create a dummy transporter that does nothing
function hasSMTP() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter = null;
if (hasSMTP()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendEmail({ to, subject, html }) {
  if (!hasSMTP() || !transporter) {
    // SMTP not configured; skip without failing
    return { skipped: true };
  }
  if (!to) to = process.env.NOTIFY_TO;
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  return transporter.sendMail({ from, to, subject, html });
}
