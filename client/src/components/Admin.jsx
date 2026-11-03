import { useEffect, useState } from 'react';
import { getEnquiries, setEnquiryStatus } from '../api.js';

const STATUSES = ['new', 'contacted', 'booked', 'closed'];
const fmtDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function Admin() {
  const [key, setKey] = useState(() => {
    try {
      return sessionStorage.getItem('adminKey') || '';
    } catch {
      return '';
    }
  });
  const [input, setInput] = useState('');
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!key) return;
    getEnquiries(key)
      .then((data) => {
        setList(data);
        setError('');
        try {
          sessionStorage.setItem('adminKey', key);
        } catch {}
      })
      .catch((err) => {
        setError(err.message);
        setKey('');
      });
  }, [key]);

  const changeStatus = async (id, status) => {
    const updated = await setEnquiryStatus(key, id, status);
    setList((l) => l.map((e) => (e.id === id ? updated : e)));
  };

  if (!key || !list) {
    return (
      <main className="admin admin-login">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setKey(input.trim());
          }}
        >
          <h1>Enquiries</h1>
          <label htmlFor="key">Admin key</label>
          <input id="key" type="password" value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
          {error && <p className="field-error">{error}</p>}
          <button className="btn" type="submit">Show enquiries</button>
        </form>
      </main>
    );
  }

  const shown = filter === 'all' ? list : list.filter((e) => e.status === filter);

  return (
    <main className="admin">
      <div className="wrap">
        <div className="admin-head">
          <h1>Enquiries</h1>
          <div className="tabs" role="group" aria-label="Filter by status">
            {['all', ...STATUSES].map((s) => (
              <button key={s} className="tab" aria-pressed={filter === s} onClick={() => setFilter(s)}>
                {s[0].toUpperCase() + s.slice(1)} ({s === 'all' ? list.length : list.filter((e) => e.status === s).length})
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="admin-empty">No enquiries here yet. New ones from the website appear at the top.</p>
        ) : (
          <ul className="admin-list">
            {shown.map((e) => (
              <li key={e.id} className={`admin-item status-${e.status}`}>
                <div className="admin-main">
                  <h2>{e.name}</h2>
                  <p className="admin-service">{e.serviceName || 'Service not chosen'}</p>
                  {e.message && <p className="admin-msg">{e.message}</p>}
                </div>
                <dl className="admin-facts">
                  <div><dt>Event</dt><dd>{fmtDate(e.eventDate)}</dd></div>
                  <div><dt>Venue</dt><dd>{e.location || '—'}</dd></div>
                  <div><dt>People</dt><dd>{e.people || '—'}</dd></div>
                  <div><dt>Received</dt><dd>{new Date(e.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
                </dl>
                <div className="admin-actions">
                  <a className="btn btn-small" href={`tel:+91${e.phone}`}>Call {e.phone}</a>
                  <a className="btn btn-small btn-line" href={`https://wa.me/91${e.phone}`} target="_blank" rel="noreferrer">WhatsApp</a>
                  {e.email && <a className="btn btn-small btn-line" href={`mailto:${e.email}`}>Email</a>}
                  <label className="visually-hidden" htmlFor={`st-${e.id}`}>Status</label>
                  <select id={`st-${e.id}`} value={e.status} onChange={(ev) => changeStatus(e.id, ev.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
