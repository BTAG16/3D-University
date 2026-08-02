import { Component } from 'react'

// Scoped fallback for a failing subtree (e.g. Mapbox failing to acquire a
// WebGL context — corporate lockdowns, disabled hardware acceleration,
// privacy-hardened browsers). Without this, an uncaught error in a child's
// effect unmounts the whole app back to an empty <div id="root">, since
// there's no boundary anywhere else in the tree to catch it.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}

export default ErrorBoundary
