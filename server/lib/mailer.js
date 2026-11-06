// Emails each new enquiry to the business inbox.
//
// Two ways to send, checked in this order:
//   1. Resend (RESEND_API_KEY) - sends over HTTPS, so it works on hosts that
//      block email ports, such as Render's free plan.
//   2. Gmail/SMTP (SMTP_USER + SMTP_PASS) - fine on your own computer or a paid host.
// With neither set, enquiries are still saved and visible at /admin, just not emailed.
import nodemailer from 'nodemailer';

let transporter = null;

const useResend = () => Boolean(process.env.RESEND_API_KEY);
const useSmtp = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

export function mailEnabled() {
  return useResend() || useSmtp();
}

export function mailMethod() {
  if (useResend()) return 'Resend';
  if (useSmtp()) return 'SMTP';
  return null;
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

async function sendWithResend({ to, replyTo, subject, text, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Without your own domain, Resend only allows this test sender, and only
      // delivers to the email address your Resend account was created with.
      from: process.env.RESEND_FROM || 'Website enquiry <onboarding@resend.dev>',
      to: [to],
      reply_to: replyTo,
      subject,
      text,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
}

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function sendEnquiryEmail(enquiry, business) {
  if (!mailEnabled()) return { sent: false, reason: 'Email not configured' };

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

  const message = {
    to: process.env.NOTIFY_EMAIL || business.email,
    replyTo: enquiry.email || undefined,
    subject: `New enquiry: ${enquiry.serviceName || 'Makeup'} — ${enquiry.name}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html,
  };

  if (useResend()) {
    await sendWithResend(message);
  } else {
    await getTransporter().sendMail({ from: `"Website enquiry" <${process.env.SMTP_USER}>`, ...message });
  }
  console.log(`Enquiry email sent via ${mailMethod()} to ${message.to}`);
  return { sent: true };
}
