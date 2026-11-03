// Set VITE_API_URL only if the API is hosted on a different domain.
const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.fields = body.fields || {};
    throw err;
  }
  return body;
}

export const getBusiness = () => request('/api/business');
export const getServices = () => request('/api/services');
export const sendEnquiry = (data) => request('/api/enquiries', { method: 'POST', body: JSON.stringify(data) });
export const getEnquiries = (key) => request('/api/enquiries', { headers: { 'x-admin-key': key } });
export const setEnquiryStatus = (key, id, status) =>
  request(`/api/enquiries/${id}`, { method: 'PATCH', headers: { 'x-admin-key': key }, body: JSON.stringify({ status }) });

export const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
