import { useEffect, useRef, useState } from 'react'
import { listMessages, sendMessage } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function MessageThread({ bloodRequestId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  const loadMessages = async () => {
    try {
      const data = await listMessages(bloodRequestId)
      setMessages(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()

    const intervalId = setInterval(() => {
      loadMessages()
    }, 8000)

    return () => clearInterval(intervalId)
  }, [bloodRequestId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setSending(true)
    setError('')
    try {
      await sendMessage(bloodRequestId, content.trim())
      setContent('')
      await loadMessages()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="border-t border-secondary/20 pt-3 mt-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-2">
          {error}
        </p>
      )}

      <div className="max-h-60 overflow-y-auto space-y-2 mb-3 pr-1">
        {loading ? (
          <p className="text-sm text-text-muted">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-text-muted">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_username === user?.username
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? 'bg-primary text-white'
                      : 'bg-background text-text'
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs font-medium mb-1 opacity-70">
                      {msg.sender_username}
                    </p>
                  )}
                  <p>{msg.content}</p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-secondary/30 px-4 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default MessageThread
