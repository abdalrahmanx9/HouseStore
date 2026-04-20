import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function LoadingBar() {
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const t1 = setTimeout(() => setLoading(true), 0)
    const t2 = setTimeout(() => setLoading(false), 500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [location.pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-primary/20 overflow-hidden">
      <div className="h-full w-1/3 bg-primary rounded-full nprogress-bar" />
    </div>
  )
}
