import React from 'react'

export default function LogLine(props) {
  if (props.type === 'text') return <div>{props.text}</div>
  if (props.type === 'skip') return <div style={{ color: '#888' }}>{props.actorId} skipped</div>
  if (props.type === 'card') return <div>{props.actorId} used {props.cardId}</div>
  if (props.type === 'result') return <div>{props.result}</div>
  return <div>{JSON.stringify(props)}</div>
}
