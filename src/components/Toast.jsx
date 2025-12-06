import { useState, useEffect, createContext, useContext } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import './Toast.css'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
    
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const Toast = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  const icons = {
    success: <CheckCircle className="toast-icon" />,
    error: <AlertCircle className="toast-icon" />,
    warning: <AlertTriangle className="toast-icon" />,
    info: <Info className="toast-icon" />,
  }

  return (
    <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
      <div className="toast-content">
        {icons[type]}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <X size={18} />
      </button>
    </div>
  )
}
