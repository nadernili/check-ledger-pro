import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js';
import cron from 'node-cron';
import { sendEmail } from './utils/mailer.js';

const app = express();
app.use(cors());
app.use(express.json());

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    type: row.type,
    date: row.date,
    check_number: row.check_number,
    payee: row.payee,
    notes: row.notes,
    reminder_minutes_before: row.reminder_minutes_before
  };
}

// Create event
app.post('/api/events', (req, res) => {
  const { title, amount, type, date, check_number, payee, notes, reminder_minutes_before } = req.body;
  if (!title || !amount || !type || !date) return res.status(400).json({ error: 'Missing required fields' });
  const stmt = db.prepare(`INSERT INTO events (title, amount, type, date, check_number, payee, notes, reminder_minutes_before)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(title, amount, type, date, check_number || null, payee || null, notes || null, reminder_minutes_before ?? null, function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// List events (optionally by range)
app.get('/api/events', (req, res) => {
  const { start, end } = req.query; // ISO YYYY-MM-DD
  let sql = 'SELECT * FROM events';
  const params = [];
  if (start && end) {
    sql += ' WHERE date BETWEEN ? AND ?';
    params.push(start, end);
  }
  sql += ' ORDER BY date ASC, id DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(mapRow));
  });
});

// Get single
app.get('/api/events/:id', (req, res) => {
  db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(mapRow(row));
  });
});

// Update
app.put('/api/events/:id', (req, res) => {
  const { title, amount, type, date, check_number, payee, notes, reminder_minutes_before } = req.body;
  const stmt = db.prepare(`UPDATE events SET title=?, amount=?, type=?, date=?, check_number=?, payee=?, notes=?, reminder_minutes_before=? WHERE id=?`);
  stmt.run(title, amount, type, date, check_number || null, payee || null, notes || null, reminder_minutes_before ?? null, req.params.id, function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changed: this.changes });
  });
});

// Delete
app.delete('/api/events/:id', (req, res) => {
  db.run('DELETE FROM events WHERE id = ?', [req.params.id], function(err){
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Reports
app.get('/api/reports', (req, res) => {
  const { start, end } = req.query; // required
  if (!start || !end) return res.status(400).json({ error: 'start and end required (YYYY-MM-DD)' });

  const totalsSql = `SELECT type, ROUND(SUM(amount),2) as total FROM events WHERE date BETWEEN ? AND ? GROUP BY type`;
  const dailySql = `SELECT date, type, ROUND(SUM(amount),2) as total FROM events WHERE date BETWEEN ? AND ? GROUP BY date, type ORDER BY date ASC`;

  db.all(totalsSql, [start, end], (err, totalsRows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.all(dailySql, [start, end], (err2, dailyRows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const totals = { deposit: 0, payment: 0 };
      for (const r of totalsRows) totals[r.type] = Number(r.total);
      res.json({ totals, daily: dailyRows });
    });
  });
});

// CSV export
app.get('/api/export.csv', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).send('start and end required');
  db.all('SELECT * FROM events WHERE date BETWEEN ? AND ? ORDER BY date ASC', [start, end], (err, rows) => {
    if (err) return res.status(500).send('Error');
    const header = 'id,title,amount,type,date,check_number,payee,notes\n';
    const csv = rows.map(r => [r.id, JSON.stringify(r.title), r.amount, r.type, r.date, JSON.stringify(r.check_number||''), JSON.stringify(r.payee||''), JSON.stringify(r.notes||'')].join(','));
    res.setHeader('Content-Type', 'text/csv');
    res.send(header + csv.join('\n'));
  });
});

// Reminder scheduler: every 5 minutes
cron.schedule('*/5 * * * *', () => {
  const now = new Date();
  const inFive = new Date(now.getTime() + 5*60*1000);

  const eventTime = '09:00'; // default time if only date is stored

  const sql = `SELECT * FROM events WHERE reminder_minutes_before IS NOT NULL`;
  db.all(sql, [], async (err, rows) => {
    if (err || !rows) return;
    for (const e of rows) {
      try {
        const dt = new Date(`${e.date}T${eventTime}:00`);
        const triggerAt = new Date(dt.getTime() - (e.reminder_minutes_before||0)*60000);
        if (triggerAt > now && triggerAt <= inFive) {
          await sendEmail({
            subject: `[Check Ledger] Reminder: ${e.type === 'deposit' ? 'Deposit' : 'Payment'} — ${e.title} (${e.amount}) on ${e.date}`,
            html: `<p><b>${e.title}</b> — ${e.type.toUpperCase()} — $${Number(e.amount).toFixed(2)}</p>
                   <p>Date: ${e.date}</p>
                   <p>Payee: ${e.payee || '-'} &nbsp; Check #: ${e.check_number || '-'}</p>
                   <p>Notes: ${e.notes || '-'}</p>`
          });
        }
      } catch {}
    }
  });
});

const port = process.env.PORT || 5050;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
