import * as React from 'react'
import { useEffect, useState } from 'react'
import Dashboard from './Dashboard'
import Overlay from './Overlay'

function App(): React.JSX.Element {
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || 'dashboard')

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash.replace('#', '') || 'dashboard')
    }
    window.addEventListener('hashchange', handleHashChange)

    // Initial check
    const current = window.location.hash.replace('#', '')
    if (current && current !== route) {
      setRoute(current)
    }

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (route === 'overlay') {
    return <Overlay />
  }

  return <Dashboard />
}

export default App
