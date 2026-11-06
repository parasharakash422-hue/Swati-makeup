import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { addEnquiry, listEnquiries, updateEnquiryStatus } from './lib/store.js';
import { mailEnabled, mailMethod, sendEnquiryEmail } from './lib/mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readJson = (f) => JSON.parse(readFileSync(path.join(__dirname, 'data', f), 'utf8'));

const business = readJson('business.json');
const services = readJson('services.json');
const serviceById = new Map(services.flatMap((c) => c.items).map((s) => [s.id, s]));

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  })
);

// ---------- Public API ----------

app.get('/api/health', (_req, res) => res.json({ ok: true, email: mailEnabled() }));

app.get('/api/business', (_req, res) => res.json(business));

app.get('/api/services', (_req, res) => res.json(services));

// Simple per-IP limit: 5 enquiries per 15 minutes, to stop spam floods.
const hits = new Map();
function rateLimit(req, res, next) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= 5) {
    return res.status(429).json({ error: 'Too many enquiries from this device. Please call or WhatsApp instead.' });
  }
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function validate(body) {
  const data = {
    name: clean(body.name, 80),
    phone: clean(body.phone, 20),
    email: clean(body.email, 120),
    serviceId: clean(body.serviceId, 40),
    eventDate: clean(body.eventDate, 10),
    location: clean(body.location, 120),
    people: clean(String(body.people ?? ''), 3),
    message: clean(body.message, 1500),
  };
  const errors = {};

  if (data.name.length < 2) errors.name = 'Enter your name.';
  const digits = data.phone.replace(/\D/g, '');
  if (!/^(91)?[6-9]\d{9}$/.test(digits)) errors.phone = 'Enter a 10-digit Indian mobile number.';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = 'Enter a valid email, or leave it blank.';
  if (data.serviceId && !serviceById.has(data.serviceId)) errors.serviceId = 'Choose a service from the menu.';
  if (data.eventDate) {
    const d = new Date(`${data.eventDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime())) errors.eventDate = 'Enter a valid date.';
    else if (d < today) errors.eventDate = 'The event date is in the past.';
  }
  if (data.people && !/^\d{1,2}$/.test(data.people)) errors.people = 'Enter the number of people.';
  if (!data.serviceId && data.message.length < 5) errors.message = 'Choose a service or tell us what you need.';

  data.phone = digits.slice(-10);
  data.serviceName = serviceById.get(data.serviceId)?.name || '';
  return { data, errors };
}

app.post('/api/enquiries', rateLimit, async (req, res) => {
  // Honeypot field: real visitors never see or fill it.
  if (req.body?.website) return res.status(201).json({ ok: true });

  const { data, errors } = validate(req.body || {});
  if (Object.keys(errors).length) return res.status(422).json({ error: 'Check the highlighted fields.', fields: errors });

  try {
    const enquiry = await addEnquiry(data);
    sendEnquiryEmail(enquiry, business).catch((err) => console.error('Email failed:', err.message));
    res.status(201).json({ ok: true, id: enquiry.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Your enquiry could not be saved. Please call or WhatsApp instead.' });
  }
});

// ---------- Admin API (needs ADMIN_KEY) ----------

function requireAdmin(req, res, next) {
  const key = process.env.ADMIN_KEY;
  if (!key) return res.status(503).json({ error: 'Set ADMIN_KEY in .env to view enquiries.' });
  if (req.get('x-admin-key') !== key) return res.status(401).json({ error: 'Wrong admin key.' });
  next();
}

app.get('/api/enquiries', requireAdmin, async (_req, res) => {
  res.json(await listEnquiries());
});

app.patch('/api/enquiries/:id', requireAdmin, async (req, res) => {
  const status = clean(req.body?.status, 20);
  if (!['new', 'contacted', 'booked', 'closed'].includes(status)) {
    return res.status(422).json({ error: 'Status must be new, contacted, booked or closed.' });
  }
  const item = await updateEnquiryStatus(req.params.id, status);
  if (!item) return res.status(404).json({ error: 'Enquiry not found.' });
  res.json(item);
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- Serve the built React site in production ----------

const dist = path.join(__dirname, '..', 'client', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(mailEnabled() ? `Enquiry emails: ON (${mailMethod()})` : 'Enquiry emails: OFF (add RESEND_API_KEY or SMTP settings)');
});
