import './LoadingSpinner.css'

export const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  }

  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  )
}

export const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="page-loader">
      <LoadingSpinner size="large" text={text} />
    </div>
  )
}

export const InlineLoader = ({ text }) => {
  return (
    <div className="inline-loader">
      <LoadingSpinner size="small" text={text} />
    </div>
  )
}

export const ButtonLoader = () => {
  return (
    <div className="button-loader">
      <div className="button-spinner"></div>
    </div>
  )
}
