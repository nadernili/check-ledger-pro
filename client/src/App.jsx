import React, { useEffect, useMemo, useState } from 'react'
import CalendarView from './components/CalendarView'
import TransactionForm from './components/TransactionForm'
import Reports from './components/Reports'
import { listEvents, createEvent, updateEvent, deleteEvent } from './api'

function todayISO(){ return new Date().toISOString().slice(0,10) }

export default function App(){
  const [events, setEvents] = useState([])
  const [modal, setModal] = useState(null) // { mode:'create'|'edit', date?, event? }

  async function loadRange(){
    // Load current month for simplicity
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10)
    const last = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10)
    const items = await listEvents({ start:first, end:last })
    setEvents(items)
  }

  useEffect(()=>{ loadRange() }, [])

  async function handleCreate(payload){
    await createEvent(payload)
    setModal(null)
    await loadRange()
  }

  async function handleUpdate(id, payload){
    await updateEvent(id, payload)
    setModal(null)
    await loadRange()
  }

  async function handleDelete(id){
    if (!confirm('Delete this entry?')) return
    await deleteEvent(id)
    setModal(null)
    await loadRange()
  }

  const initialNew = useMemo(()=> ({ type:'deposit', title:'', amount:'', date: todayISO(), check_number:'', payee:'', notes:'', reminder_minutes_before: null }), [])

  return (
    <div className="container">
      <div className="header">
        <h2>Check Ledger Calendar</h2>
        <button className="button" onClick={()=>setModal({mode:'create', date: todayISO()})}>Add Check</button>
      </div>

      <div className="row">
        <div className="col">
          <CalendarView
            events={events}
            onDateClick={(date)=> setModal({ mode:'create', date }) }
            onEventClick={(id)=> {
              const ev = events.find(e=> String(e.id)===String(id))
              setModal({ mode:'edit', event: ev })
            }}
          />
        </div>
        <div className="col">
          <Reports />
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop">
          <div className="modal">
            {modal.mode==='create' && (
              <>
                <h3 style={{marginTop:0}}>Add Deposit / Payment</h3>
                <TransactionForm initial={{...initialNew, date: modal.date || initialNew.date}} onSubmit={handleCreate} onCancel={()=>setModal(null)} />
              </>
            )}
            {modal.mode==='edit' && (
              <>
                <h3 style={{marginTop:0}}>Edit Entry</h3>
                <TransactionForm initial={modal.event} onSubmit={(p)=>handleUpdate(modal.event.id, p)} onCancel={()=>setModal(null)} />
                <div style={{marginTop:12}}>
                  <button className="button secondary" onClick={()=>handleDelete(modal.event.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
