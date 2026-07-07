import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import './Toast.css'

const ToastContext = createContext()

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error:   (message, duration) => addToast(message, 'error',   duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info:    (message, duration) => addToast(message, 'info',    duration),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const Toast = ({ message, type, duration, onClose }) => {
  const [isExiting, setIsExiting] = useState(false)
  const closedRef = useRef(false)

  const handleClose = () => {
    if (closedRef.current) return
    closedRef.current = true
    setIsExiting(true)
    setTimeout(onClose, 260)
  }

  useEffect(() => {
    if (duration === Infinity) return
    const timer = setTimeout(handleClose, duration)
    return () => clearTimeout(timer)
  }, [])

  const icons = {
    success: <CheckCircle className="toast-icon" size={15} />,
    error:   <AlertCircle className="toast-icon" size={15} />,
    warning: <AlertTriangle className="toast-icon" size={15} />,
    info:    <Info className="toast-icon" size={15} />,
  }

  return (
    <div className={`toast toast-${type}${isExiting ? ' toast-exit' : ''}`}>
      {duration !== Infinity && (
        <div
          className="toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
      <div className="toast-content">
        {icons[type]}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Dismiss">
        <X size={13} />
      </button>
    </div>
  )
}
