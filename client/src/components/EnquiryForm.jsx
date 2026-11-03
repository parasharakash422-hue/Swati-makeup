import { useState } from 'react';
import { sendEnquiry, rupees } from '../api.js';

const EMPTY = { name: '', phone: '', email: '', eventDate: '', location: '', people: '', message: '', website: '' };

function Field({ id, label, optional, error, wide, children }) {
  return (
    <div className={`field${wide ? ' field-wide' : ''}${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function EnquiryForm({ business, services, selectedService, onServiceChange }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const chosen = services.flatMap((c) => c.items).find((s) => s.id === selectedService);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const a11y = (name) => ({
    id: name,
    name,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      await sendEnquiry({ ...form, serviceId: selectedService });
      setStatus('sent');
    } catch (err) {
      setErrors(err.fields || {});
      setMessage(err.message);
      setStatus('error');
      const first = Object.keys(err.fields || {})[0];
      if (first) document.getElementById(first === 'serviceId' ? 'service' : first)?.focus();
    }
  };

  const reset = () => {
    setForm(EMPTY);
    onServiceChange('');
    setErrors({});
    setStatus('idle');
  };

  return (
    <section className="enquire" id="enquire" aria-labelledby="enquire-title">
      <div className="wrap enquire-inner">
        <div className="enquire-intro">
          <h2 id="enquire-title">Ask about a booking</h2>
          <p>
            Tell Swati what you need and when. She will call or WhatsApp you on the number you give to talk
            through the look and confirm a quote.
          </p>
          {chosen && status !== 'sent' && (
            <div className="chosen" aria-live="polite">
              <span className="pan" style={{ '--shade': chosen.shade }} aria-hidden="true" />
              <div>
                <strong>{chosen.name}</strong>
                <span>from {rupees(chosen.price)}</span>
              </div>
            </div>
          )}
          <p className="enquire-alt">
            Prefer to talk now? Call <a href={`tel:+${business.phoneRaw}`}>{business.phone}</a>.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="form-done" role="status">
            <h3>Enquiry sent</h3>
            <p>
              Thank you, {form.name.split(' ')[0]}. Swati will get back to you on {form.phone}. If your date is
              less than a week away, call her directly so she can check availability straight away.
            </p>
            <button className="btn btn-line" onClick={reset}>Send another enquiry</button>
          </div>
        ) : (
          <form className="form" onSubmit={submit} noValidate>
            {status === 'error' && message && (
              <p className="form-error" role="alert">
                {message}
              </p>
            )}

            <div className="form-grid">
              <Field id="name" label="Your name" error={errors.name}>
                <input {...a11y('name')} value={form.name} onChange={update} autoComplete="name" required />
              </Field>

              <Field id="phone" label="Mobile number" error={errors.phone}>
                <input
                  {...a11y('phone')}
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={update}
                  autoComplete="tel"
                  placeholder="98xxxxxxxx"
                  required
                />
              </Field>

              <Field id="service" label="Service" error={errors.serviceId}>
                <select
                  id="service"
                  name="serviceId"
                  value={selectedService}
                  onChange={(e) => onServiceChange(e.target.value)}
                  aria-invalid={Boolean(errors.serviceId)}
                >
                  <option value="">Not sure yet</option>
                  {services.map((c) => (
                    <optgroup key={c.category} label={c.category}>
                      {c.items.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (from {rupees(s.price)})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>

              <Field id="eventDate" label="Event date" optional error={errors.eventDate}>
                <input {...a11y('eventDate')} type="date" min={today} value={form.eventDate} onChange={update} />
              </Field>

              <Field id="location" label="Venue or area" optional error={errors.location}>
                <input {...a11y('location')} value={form.location} onChange={update} placeholder="e.g. Noida Sector 62" />
              </Field>

              <Field id="people" label="Number of people" optional error={errors.people}>
                <input {...a11y('people')} type="number" min="1" max="99" value={form.people} onChange={update} />
              </Field>

              <Field id="email" label="Email" optional error={errors.email}>
                <input {...a11y('email')} type="email" value={form.email} onChange={update} autoComplete="email" />
              </Field>

              <Field id="message" wide label="Anything else Swati should know" optional={Boolean(selectedService)} error={errors.message}>
                  <textarea
                    {...a11y('message')}
                    rows="4"
                    value={form.message}
                    onChange={update}
                    placeholder="Outfit colours, the look you have in mind, getting-ready time…"
                  />
              </Field>

              {/* Spam trap: hidden from people, filled in by bots */}
              <div className="hp" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex="-1" autoComplete="off" value={form.website} onChange={update} />
              </div>
            </div>

            <button className="btn btn-submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending enquiry…' : 'Send enquiry'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
