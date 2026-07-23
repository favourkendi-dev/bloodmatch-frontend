import { useEffect, useState } from 'react'

function Toast({ message, onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-primary text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium animate-bounce">
      {message}
    </div>
  )
}

export default Toast
