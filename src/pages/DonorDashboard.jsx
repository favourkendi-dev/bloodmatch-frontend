import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getDonorProfile,
  updateDonorProfile,
  listBloodRequests,
  listMyMatches,
  acceptRequest,
  declineRequest,
} from '../lib/api'

const STATUS_STYLES = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-yellow-50 text-yellow-700',
  fulfilled: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

function DonorDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [openRequests, setOpenRequests] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState(false)
  const [actingOn, setActingOn] = useState(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [profileData, requestsData, matchesData] = await Promise.all([
        getDonorProfile(),
        listBloodRequests(),
        listMyMatches(),
      ])
      setProfile(profileData)
      setOpenRequests(requestsData)
      setMatches(matchesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll()
  }, [])

  const handleToggleAvailability = async () => {
    if (!profile) return
    setToggling(true)
    setError('')
    try {
      const updated = await updateDonorProfile({ is_available: !profile.is_available })
      setProfile(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setToggling(false)
    }
  }

  const handleAccept = async (id) => {
    setActingOn(id)
    setError('')
    try {
      await acceptRequest(id)
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActingOn(null)
    }
  }

  const handleDecline = async (id) => {
    setActingOn(id)
    setError('')
    try {
      await declineRequest(id)
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActingOn(null)
    }
  }

  const pendingMatches = matches.filter(
    (m) => m.status === 'in_progress' && !m.donor_confirmed
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted">Loading dashboard...</p>
      </div>
    )
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

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex justify-between items-center">
          <div>
            <p className="text-text font-medium">
              Blood Type: <span className="text-primary">{profile?.blood_type || 'Not set'}</span>
            </p>
            <p className="text-text-muted text-sm">
              City: {profile?.city || 'Not set'} · {profile?.total_donations ?? 0} total donation(s)
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={toggling}
            className={`px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-50 ${
              profile?.is_available
                ? 'bg-primary text-white'
                : 'bg-background text-text-muted border border-secondary/30'
            }`}
          >
            {profile?.is_available ? 'Available' : 'Unavailable'}
          </button>
        </div>

        {/* Pending matches needing a response */}
        {pendingMatches.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text mb-3">Awaiting Your Response</h2>
            <div className="space-y-3">
              {pendingMatches.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl shadow-md p-5 border border-primary/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-lg font-semibold text-primary">{req.blood_type}</span>
                      <span className="text-text-muted text-sm ml-2">
                        {req.units_needed} unit{req.units_needed > 1 ? 's' : ''} · {req.city}
                      </span>
                      <p className="text-text-muted text-sm">{req.hospital_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={actingOn === req.id}
                      className="flex-1 bg-primary text-white text-sm font-medium py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      disabled={actingOn === req.id}
                      className="flex-1 bg-background text-text-muted text-sm font-medium py-2 rounded-full border border-secondary/30 transition disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open requests */}
        <h2 className="text-lg font-semibold text-text mb-3">Open Requests</h2>
        {openRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center text-text-muted">
            No open requests right now.
          </div>
        ) : (
          <div className="space-y-3">
            {openRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-semibold text-primary">{req.blood_type}</span>
                    <span className="text-text-muted text-sm ml-2">
                      {req.units_needed} unit{req.units_needed > 1 ? 's' : ''} · {req.city}
                    </span>
                    <p className="text-text-muted text-sm">{req.hospital_name}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[req.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                {req.notes && <p className="text-sm text-text-muted">{req.notes}</p>}
                <p className="text-xs text-text-muted mt-2 capitalize">{req.urgency} urgency</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DonorDashboard
