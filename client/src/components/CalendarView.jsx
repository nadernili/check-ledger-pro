import React, { useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function CalendarView({ events, onDateClick, onEventClick }){
  const ref = useRef(null)
  useEffect(()=>{
    if (!ref.current) return
    const calendar = new FullCalendar.Calendar(ref.current, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      height: 'auto',
      dateClick: info => onDateClick(info.dateStr),
      events: events.map(e => ({ id: String(e.id), title: `${e.title} — $${Number(e.amount).toFixed(2)}`, start: e.date, className: e.type })),
      eventClick: info => onEventClick(info.event.id)
    })
    calendar.render()
    return () => calendar.destroy()
  }, [events])

  return <div className="card" ref={ref}></div>
}
