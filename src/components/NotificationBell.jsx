import { useEffect, useState, useRef } from 'react'
import { listNotifications, markNotificationRead } from '../lib/api'

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const load = async () => {
    setLoading(true)
    try {
      const data = await listNotifications()
      setNotifications(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch {
      // ignore
    }
  }

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read)
    await Promise.all(unread.map((n) => markNotificationRead(n.id)))
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-sm font-medium text-text hover:text-primary transition"
      >
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-secondary/20 z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-secondary/20">
            <p className="text-sm font-semibold text-text">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {loading && notifications.length === 0 ? (
            <p className="p-4 text-sm text-text-muted">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="p-4 text-sm text-text-muted">No notifications</p>
          ) : (
            <div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 border-b border-secondary/10 text-sm ${
                    n.is_read ? 'text-text-muted' : 'text-text font-medium bg-blue-50/50'
                  }`}
                >
                  <p>{n.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-text-muted">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
