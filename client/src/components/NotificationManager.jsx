import React, { createContext, useContext, useState, useCallback } from 'react'
import './NotificationManager.css'

const NotificationContext = createContext({ notify: () => {} })

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const notify = useCallback((message, type = 'info', timeout = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, timeout)
  }, [])

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="notification-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
