import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  listBloodRequests,
  createBloodRequest,
  updateBloodRequest,
  deleteBloodRequest,
  getRequestMatches,
  selectDonor,
  fulfillRequest,
  cancelRequest,
} from '../lib/api'
import MessageThread from '../components/MessageThread'
import NotificationBell from '../components/NotificationBell'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const URGENCY_LEVELS = ['normal', 'urgent', 'critical']

const STATUS_STYLES = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-yellow-50 text-yellow-700',
  fulfilled: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

const EMPTY_FORM = {
  blood_type: '',
  units_needed: 1,
  urgency: 'normal',
  city: '',
  notes: '',
}

function HospitalDashboard() {
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState(EMPTY_FORM)

  const [editingRequestId, setEditingRequestId] = useState(null)
  const [editFormData, setEditFormData] = useState(EMPTY_FORM)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingRequestId, setDeletingRequestId] = useState(null)

  const [expandedRequestId, setExpandedRequestId] = useState(null)
  const [matchesByRequest, setMatchesByRequest] = useState({})
  const [matchesLoading, setMatchesLoading] = useState(false)
  const [selectingDonorId, setSelectingDonorId] = useState(null)

  const [actioningRequestId, setActioningRequestId] = useState(null)

  const [openThreadId, setOpenThreadId] = useState(null)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listBloodRequests()
      setRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      if (!isMounted) return
      setLoading(true)
      await loadRequests()
      if (isMounted) setLoading(false)
    }

    initialize()

    const intervalId = setInterval(() => {
      loadRequests()
    }, 20000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [loadRequests])

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
      setFormData(EMPTY_FORM)
      setShowForm(false)
      await loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const startEditing = (req) => {
    setEditingRequestId(req.id)
    setEditFormData({
      blood_type: req.blood_type,
      units_needed: req.units_needed,
      urgency: req.urgency,
      city: req.city,
      notes: req.notes || '',
    })
  }

  const cancelEditing = () => {
    setEditingRequestId(null)
    setEditFormData(EMPTY_FORM)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveEdit = async (requestId) => {
    setSavingEdit(true)
    setError('')
    try {
      await updateBloodRequest(requestId, {
        ...editFormData,
        units_needed: Number(editFormData.units_needed),
      })
      setEditingRequestId(null)
      await loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDelete = async (requestId) => {
    if (!confirm('Delete this request? This cannot be undone.')) return
    setDeletingRequestId(requestId)
    setError('')
    try {
      await deleteBloodRequest(requestId)
      await loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingRequestId(null)
    }
  }

  const handleViewMatches = async (requestId) => {
    if (expandedRequestId === requestId) {
      setExpandedRequestId(null)
      return
    }

    setExpandedRequestId(requestId)
    setError('')

    if (!matchesByRequest[requestId]) {
      setMatchesLoading(true)
      try {
        const donors = await getRequestMatches(requestId)
        setMatchesByRequest((prev) => ({ ...prev, [requestId]: donors }))
      } catch (err) {
        setError(err.message)
      } finally {
        setMatchesLoading(false)
      }
    }
  }

  const handleSelectDonor = async (requestId, donorId, openChatAfter) => {
    setSelectingDonorId(donorId)
    setError('')
    try {
      await selectDonor(requestId, donorId)
      setExpandedRequestId(null)
      await loadRequests()
      if (openChatAfter) {
        setOpenThreadId(requestId)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSelectingDonorId(null)
    }
  }

  const handleFulfill = async (requestId) => {
    setActioningRequestId(requestId)
    setError('')
    try {
      await fulfillRequest(requestId)
      await loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningRequestId(null)
    }
  }

  const handleCancel = async (requestId) => {
    setActioningRequestId(requestId)
    setError('')
    try {
      await cancelRequest(requestId)
      await loadRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningRequestId(null)
    }
  }

  const toggleThread = (requestId) => {
    setOpenThreadId((prev) => (prev === requestId ? null : requestId))
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-text">
            Welcome, {user?.username}
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={logout}
              className="text-sm text-primary font-medium hover:underline"
            >
              Log Out
            </button>
          </div>
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
                {editingRequestId === req.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        name="blood_type"
                        value={editFormData.blood_type}
                        onChange={handleEditChange}
                        className="rounded-xl border border-secondary/30 px-3 py-2 text-sm"
                      >
                        {BLOOD_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        name="units_needed"
                        min={1}
                        value={editFormData.units_needed}
                        onChange={handleEditChange}
                        className="rounded-xl border border-secondary/30 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      {URGENCY_LEVELS.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setEditFormData((prev) => ({ ...prev, urgency: level }))}
                          className={`flex-1 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                            editFormData.urgency === level
                              ? 'bg-primary text-white'
                              : 'bg-background text-text-muted'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      name="city"
                      value={editFormData.city}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-secondary/30 px-3 py-2 text-sm"
                      placeholder="City"
                    />
                    <textarea
                      name="notes"
                      value={editFormData.notes}
                      onChange={handleEditChange}
                      rows={2}
                      className="w-full rounded-xl border border-secondary/30 px-3 py-2 text-sm"
                      placeholder="Notes"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(req.id)}
                        disabled={savingEdit}
                        className="flex-1 bg-primary text-white text-sm font-medium py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
                      >
                        {savingEdit ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 bg-background text-text-muted text-sm font-medium py-2 rounded-full border border-secondary/30"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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

                    <div className="flex justify-between items-center text-xs text-text-muted mb-3">
                      <span className="capitalize">{req.urgency} urgency</span>
                      {req.matched_donor_username && (
                        <span>Matched: {req.matched_donor_username}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {req.status === 'open' && (
                        <>
                          <button
                            onClick={() => handleViewMatches(req.id)}
                            className="text-sm text-primary font-medium hover:underline"
                          >
                            {expandedRequestId === req.id ? 'Hide Matches' : 'View Matches'}
                          </button>
                          <button
                            onClick={() => startEditing(req)}
                            className="text-sm text-primary font-medium hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(req.id)}
                            disabled={deletingRequestId === req.id}
                            className="text-sm text-critical font-medium hover:underline disabled:opacity-50"
                          >
                            {deletingRequestId === req.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}

                      {req.status === 'in_progress' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFulfill(req.id)}
                            disabled={actioningRequestId === req.id}
                            className="bg-success text-white text-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
                          >
                            {actioningRequestId === req.id ? 'Working...' : 'Mark Fulfilled'}
                          </button>
                          <button
                            onClick={() => handleCancel(req.id)}
                            disabled={actioningRequestId === req.id}
                            className="bg-white text-critical border border-critical text-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}

                      {req.matched_donor_username && (
                        <button
                          onClick={() => toggleThread(req.id)}
                          className="text-sm text-primary font-medium hover:underline"
                        >
                          {openThreadId === req.id ? 'Hide Messages' : `Message ${req.matched_donor_username}`}
                        </button>
                      )}
                    </div>

                    {expandedRequestId === req.id && (
                      <div className="mt-3 border-t border-secondary/20 pt-3">
                        {matchesLoading ? (
                          <p className="text-sm text-text-muted">Finding compatible donors...</p>
                        ) : (matchesByRequest[req.id] || []).length === 0 ? (
                          <p className="text-sm text-text-muted">No compatible donors found nearby.</p>
                        ) : (
                          <div className="space-y-2">
                            {matchesByRequest[req.id].map((donor) => (
                              <div
                                key={donor.id}
                                className="flex justify-between items-center bg-background rounded-xl px-4 py-3"
                              >
                                <div>
                                  <p className="text-sm font-medium text-text">
                                    {donor.username} · {donor.blood_type}
                                  </p>
                                  <p className="text-xs text-text-muted">
                                    {donor.city}
                                    {donor.distance_km !== null && ` · ${donor.distance_km} km away`}
                                    {' · '}
                                    <span className={donor.is_available ? 'text-green-600' : 'text-gray-500'}>
                                      {donor.is_available ? 'Available' : 'Unavailable'}
                                    </span>
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSelectDonor(req.id, donor.id, false)}
                                    disabled={selectingDonorId === donor.id}
                                    className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
                                  >
                                    {selectingDonorId === donor.id ? 'Selecting...' : 'Select'}
                                  </button>
                                  <button
                                    onClick={() => handleSelectDonor(req.id, donor.id, true)}
                                    disabled={selectingDonorId === donor.id}
                                    className="bg-background text-primary border border-primary text-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
                                  >
                                    Select &amp; Chat
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {openThreadId === req.id && (
                      <MessageThread bloodRequestId={req.id} />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HospitalDashboard
