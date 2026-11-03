require('dotenv').config();
const nodemailer = require('nodemailer');

const keys = Object.keys(process.env).filter(k => /SMTP|MAIL|GMAIL/i.test(k));
console.log('Email-related variables found in .env:', keys);

const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS;
console.log('User:', user);
console.log('Password length:', pass ? pass.length : 'MISSING', '(should be 16)');

nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  .verify()
  .then(() => console.log('✅ Gmail login works. The bug is in index.js.'))
  .catch(e => console.log('❌ Gmail rejected it:', e.message));