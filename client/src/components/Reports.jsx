import React, { useEffect, useState } from 'react'
import { getReport, exportCsvUrl } from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

function fmt(n){ return (Number(n)||0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}) }

export default function Reports(){
  const [range, setRange] = useState('month')
  const [custom, setCustom] = useState({ start:'', end:'' })
  const [data, setData] = useState({ totals: {deposit:0, payment:0}, daily: [] })

  function getRange(){
    const today = new Date();
    const toISO = d => d.toISOString().slice(0,10)
    if (range === 'week'){
      const day = today.getDay(); // 0 Sun
      const monday = new Date(today); monday.setDate(today.getDate() - ((day+6)%7))
      const sunday = new Date(monday); sunday.setDate(monday.getDate()+6)
      return { start: toISO(monday), end: toISO(sunday) }
    }
    if (range === 'month'){
      const first = new Date(today.getFullYear(), today.getMonth(), 1)
      const last = new Date(today.getFullYear(), today.getMonth()+1, 0)
      return { start: toISO(first), end: toISO(last) }
    }
    return { start: custom.start, end: custom.end }
  }

  async function load(){
    const { start, end } = getRange()
    if (!start || !end) return
    const r = await getReport({ start, end })
    setData(r)
  }

  useEffect(()=>{ load() }, [range, custom.start, custom.end])

  const chartData = Object.values(
    data.daily.reduce((acc, r)=>{
      if (!acc[r.date]) acc[r.date] = { date:r.date, deposit:0, payment:0 }
      acc[r.date][r.type] = r.total
      return acc
    }, {})
  )

  const { start, end } = getRange()

  return (
    <div className="card">
      <div style={{display:'flex', gap:12, alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button className={`button ${range==='week'?'':'secondary'}`} onClick={()=>setRange('week')}>This Week</button>
          <button className={`button ${range==='month'?'':'secondary'}`} onClick={()=>setRange('month')}>This Month</button>
          <button className={`button ${range==='custom'?'':'secondary'}`} onClick={()=>setRange('custom')}>Custom</button>
          {range==='custom' && (
            <>
              <input className="input" type="date" value={custom.start} onChange={e=>setCustom(p=>({...p,start:e.target.value}))} />
              <input className="input" type="date" value={custom.end} onChange={e=>setCustom(p=>({...p,end:e.target.value}))} />
            </>
          )}
        </div>
        <a className="button" href={exportCsvUrl({ start, end })}>Export CSV</a>
      </div>

      <div style={{display:'flex', gap:16, marginBottom:12}}>
        <div className="badge deposit">Deposits: ${fmt(data.totals.deposit)}</div>
        <div className="badge payment">Payments: ${fmt(data.totals.payment)}</div>
        <div className="badge">Net: ${fmt((data.totals.deposit||0) - (data.totals.payment||0))}</div>
      </div>

      <div style={{width:'100%', height:320}}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="deposit" fill="#16a34a" />
            <Bar dataKey="payment" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
