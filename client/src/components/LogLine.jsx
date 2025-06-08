import React from 'react'
import './LogLine.css'

export default function LogLine({ text }) {
  return <div className="log-line" role="log">{text}</div>
}
