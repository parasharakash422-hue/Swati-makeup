// Emails each new enquiry to the business inbox.
// Works only when SMTP settings are present in .env; otherwise enquiries
// are still saved and visible at /api/enquiries, just not emailed.
import nodemailer from 'nodemailer';

let transporter = null;

export function mailEnabled() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function sendEnquiryEmail(enquiry, business) {
  if (!mailEnabled()) return { sent: false, reason: 'SMTP not configured' };

  const rows = [
    ['Name', enquiry.name],
    ['Phone', enquiry.phone],
    ['Email', enquiry.email || '—'],
    ['Service', enquiry.serviceName || '—'],
    ['Event date', enquiry.eventDate || '—'],
    ['Location', enquiry.location || '—'],
    ['People', enquiry.people || '—'],
    ['Message', enquiry.message || '—'],
  ];

  const html = `
    <h2 style="font-family:Georgia,serif">New makeup enquiry</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><strong>${esc(v)}</strong></td></tr>`).join('')}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#666">
      Reply on WhatsApp: https://wa.me/91${esc(enquiry.phone).replace(/\D/g, '').slice(-10)}
    </p>`;

  await getTransporter().sendMail({
    from: `"Website enquiry" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL || business.email,
    replyTo: enquiry.email || undefined,
    subject: `New enquiry: ${enquiry.serviceName || 'Makeup'} — ${enquiry.name}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html,
  });
  return { sent: true };
}
