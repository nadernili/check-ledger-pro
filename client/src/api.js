const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

export async function listEvents({ start, end }) {
  const qs = start && end ? `?start=${start}&end=${end}` : '';
  const r = await fetch(`${API_BASE}/api/events${qs}`);
  return r.json();
}

export async function createEvent(payload){
  const r = await fetch(`${API_BASE}/api/events`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  return r.json();
}

export async function updateEvent(id, payload){
  const r = await fetch(`${API_BASE}/api/events/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
  return r.json();
}

export async function deleteEvent(id){
  const r = await fetch(`${API_BASE}/api/events/${id}`, { method:'DELETE'});
  return r.json();
}

export async function getReport({ start, end }){
  const r = await fetch(`${API_BASE}/api/reports?start=${start}&end=${end}`);
  return r.json();
}

export function exportCsvUrl({ start, end }){
  return `${API_BASE}/api/export.csv?start=${start}&end=${end}`;
}
