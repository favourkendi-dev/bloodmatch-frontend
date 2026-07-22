import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listBloodRequests, createBloodRequest } from '../lib/api'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const URGENCY_LEVELS = ['normal', 'urgent', 'critical']

const STATUS_STYLES = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-yellow-50 text-yellow-700',
  fulfilled: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

function HospitalDashboard() {
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    blood_type: '',
    units_needed: 1,
    urgency: 'normal',
    city: '',
    notes: '',
  })

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await listBloodRequests()
      setRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await createBloodRequest({
        ...formData,
        units_needed: Number(formData.units_needed),
      })
      setFormData({ blood_type: '', units_needed: 1, urgency: 'normal', city: '', notes: '' })
      setShowForm(false)
      await loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-text">
            Welcome, {user?.username}
          </h1>
          <button
            onClick={logout}
            className="text-sm text-primary font-medium hover:underline"
          >
            Log Out
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text">Your Blood Requests</h2>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full hover:opacity-90 transition"
          >
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-md p-6 mb-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Blood Type</label>
                <select
                  name="blood_type"
                  value={formData.blood_type}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>Select</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Units Needed</label>
                <input
                  type="number"
                  name="units_needed"
                  min={1}
                  value={formData.units_needed}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Urgency</label>
              <div className="flex gap-2">
                {URGENCY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, urgency: level }))}
                    className={`flex-1 py-2 rounded-full text-sm font-medium capitalize transition ${
                      formData.urgency === level
                        ? 'bg-primary text-white'
                        : 'bg-background text-text-muted'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nairobi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Notes (optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Any additional context for donors..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white font-medium py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Request'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-text-muted">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center text-text-muted">
            No blood requests yet. Click "+ New Request" to post one.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-semibold text-primary">{req.blood_type}</span>
                    <span className="text-text-muted text-sm ml-2">
                      {req.units_needed} unit{req.units_needed > 1 ? 's' : ''} · {req.city}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[req.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                {req.notes && (
                  <p className="text-sm text-text-muted mb-2">{req.notes}</p>
                )}
                <div className="flex justify-between items-center text-xs text-text-muted">
                  <span className="capitalize">{req.urgency} urgency</span>
                  {req.matched_donor_username && (
                    <span>Matched: {req.matched_donor_username}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HospitalDashboard
