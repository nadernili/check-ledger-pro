import React, { useState } from 'react'

export default function TransactionForm({ initial, onSubmit, onCancel }){
  const [form, setForm] = useState(initial || { type:'deposit', title:'', amount:'', date:'', check_number:'', payee:'', notes:'', reminder_minutes_before: null })

  function update(k, v){ setForm(prev => ({...prev, [k]: v})) }

  function handleSubmit(e){ e.preventDefault();
    const payload = { ...form, amount: Number(form.amount) }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="label">Type</label>
      <select className="select" value={form.type} onChange={e=>update('type', e.target.value)}>
        <option value="deposit">Deposit</option>
        <option value="payment">Payment</option>
      </select>

      <label className="label">Name / Title</label>
      <input className="input" value={form.title} onChange={e=>update('title', e.target.value)} required />

      <label className="label">Amount</label>
      <input className="input" type="number" step="0.01" value={form.amount} onChange={e=>update('amount', e.target.value)} required />

      <label className="label">Date</label>
      <input className="input" type="date" value={form.date} onChange={e=>update('date', e.target.value)} required />

      <label className="label">Check #</label>
      <input className="input" value={form.check_number||''} onChange={e=>update('check_number', e.target.value)} />

      <label className="label">Payee</label>
      <input className="input" value={form.payee||''} onChange={e=>update('payee', e.target.value)} />

      <label className="label">Notes</label>
      <textarea className="textarea" rows={3} value={form.notes||''} onChange={e=>update('notes', e.target.value)} />

      <label className="label">Reminder (minutes before 9:00 AM of the date)</label>
      <input className="input" type="number" min="0" placeholder="e.g., 60" value={form.reminder_minutes_before ?? ''} onChange={e=>update('reminder_minutes_before', e.target.value ? Number(e.target.value) : null)} />

      <div style={{display:'flex', gap:8, marginTop:12}}>
        <button className="button" type="submit">Save</button>
        <button className="button secondary" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
