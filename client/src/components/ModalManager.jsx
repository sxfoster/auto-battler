import React, { createContext, useContext, useState, useCallback } from 'react'
import './ModalManager.css'

const ModalContext = createContext({ open: () => {}, close: () => {} })

export function ModalProvider({ children }) {
  const [modals, setModals] = useState([])

  const open = useCallback((content) => {
    const id = Math.random().toString(36).slice(2)
    setModals((m) => [...m, { id, content }])
    return id
  }, [])

  const close = useCallback((id) => {
    setModals((m) => m.filter((modal) => modal.id !== id))
  }, [])

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      {modals.map(({ id, content }) => (
        <div key={id} className="modal-overlay" onClick={() => close(id)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      ))}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
