import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getDonorProfile,
  updateDonorProfile,
  listBloodRequests,
  listMyMatches,
  acceptRequest,
  declineRequest,
  volunteerForRequest,
} from '../lib/api'
import { getRequestExpiry, sortRequestsByUrgency } from '../lib/utils'
import MessageThread from '../components/MessageThread'
import HealthCheckModal from '../components/HealthCheckModal'
import NotificationBell from '../components/NotificationBell'
import Toast from '../components/Toast'

const STATUS_STYLES = {
  open: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-yellow-50 text-yellow-700',
  fulfilled: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

const BADGE_STYLES = {
  'First Blood': 'bg-blue-100 text-blue-700',
  'Regular Donor': 'bg-green-100 text-green-700',
  Hero: 'bg-orange-100 text-orange-700',
  Lifesaver: 'bg-red-100 text-red-700',
}

function getBadges(totalDonations) {
  const badges = []
  if (totalDonations >= 1) badges.push('First Blood')
  if (totalDonations >= 3) badges.push('Regular Donor')
  if (totalDonations >= 5) badges.push('Hero')
  if (totalDonations >= 10) badges.push('Lifesaver')
  return badges
}

const URGENCY_STYLES = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  urgent: 'bg-orange-100 text-orange-700 border-orange-300',
  normal: 'bg-gray-100 text-gray-600 border-gray-300',
}

const MIN_DAYS_BETWEEN_DONATIONS = 90

function getEligibilityStatus(lastDonationDate) {
  if (!lastDonationDate) {
    return { eligible: true, daysUntilEligible: 0, eligibleDate: null }
  }
  const lastDate = new Date(lastDonationDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eligibleDate = new Date(lastDate)
  eligibleDate.setDate(eligibleDate.getDate() + MIN_DAYS_BETWEEN_DONATIONS)
  const diffTime = eligibleDate - today
  const daysUntilEligible = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return {
    eligible: daysUntilEligible <= 0,
    daysUntilEligible: daysUntilEligible > 0 ? daysUntilEligible : 0,
    eligibleDate: daysUntilEligible > 0 ? eligibleDate : null,
  }
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
  const [openThreadId, setOpenThreadId] = useState(null)
  const prevMatchesRef = useRef([])

  const [seenRequestIds, setSeenRequestIds] = useState(() => {
    try {
      const saved = localStorage.getItem('seen_request_ids')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      localStorage.removeItem('seen_request_ids')
      return new Set()
    }
  })

  const [toast, setToast] = useState(null)

  const loadAll = useCallback(async () => {
    try {
      const [profileData, requestsData, matchesData] = await Promise.all([
        getDonorProfile(),
        listBloodRequests(),
        listMyMatches(),
      ])

      const prevMatches = prevMatchesRef.current
      const newMatches = matchesData.filter(
        (m) => !prevMatches.find((pm) => pm.id === m.id)
      )
      if (newMatches.length > 0 && prevMatches.length > 0) {
        setToast(`You were matched to ${newMatches.length} new request${newMatches.length > 1 ? 's' : ''}!`)
      }

      setProfile(profileData)
      setOpenRequests(requestsData)
      setMatches(matchesData)
      prevMatchesRef.current = matchesData

      const allIds = new Set(requestsData.map((r) => r.id))
      setSeenRequestIds((prev) => {
        const merged = new Set([...prev, ...allIds])
        localStorage.setItem('seen_request_ids', JSON.stringify([...merged]))
        return merged
      })
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      if (!isMounted) return
      setLoading(true)
      await loadAll()
      if (isMounted) setLoading(false)
    }

    initialize()

    const intervalId = setInterval(() => {
      loadAll()
    }, 20000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [loadAll])

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

  const [healthCheckTarget, setHealthCheckTarget] = useState(null) // { id, action: 'volunteer' | 'accept' }

  const handleVolunteer = async (id, healthAnswers) => {
    setActingOn(id)
    setError('')
    try {
      await volunteerForRequest(id, healthAnswers)
      setHealthCheckTarget(null)
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActingOn(null)
    }
  }

  const handleAccept = async (id, healthAnswers) => {
    setActingOn(id)
    setError('')
    try {
      await acceptRequest(id, healthAnswers)
      setHealthCheckTarget(null)
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
      setOpenThreadId(null)
      setToast("You've declined the request. It's back in the open pool for other donors.")
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActingOn(null)
    }
  }

  const toggleThread = (requestId) => {
    if (openThreadId === requestId) {
      setOpenThreadId(null)
    } else {
      setOpenThreadId(requestId)
    }
  }

  const pendingMatches = matches.filter(
    (m) => m.status === 'in_progress' && !m.donor_confirmed
  )

  const acceptedMatches = matches.filter(
    (m) => m.status === 'in_progress' && m.donor_confirmed
  )

  const sortedRequests = sortRequestsByUrgency(openRequests, profile?.blood_type)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

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

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        {profile && (() => {
          const status = getEligibilityStatus(profile.last_donation_date)
          if (!status.eligible) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Not eligible to donate
                  </p>
                  <p className="text-xs text-red-600">
                    You can donate again on {status.eligibleDate.toLocaleDateString()} ({status.daysUntilEligible} day{status.daysUntilEligible > 1 ? 's' : ''} left)
                  </p>
                </div>
              </div>
            )
          }
          return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-green-700">
                  You are eligible to donate
                </p>
                <p className="text-xs text-green-600">
                  Ready to be matched with blood requests
                </p>
              </div>
            </div>
          )
        })()}

        <div className="flex justify-end gap-4 mb-4 flex-wrap">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-sm text-red-600 font-medium hover:underline"
            >
              Admin Panel
            </Link>
          )}
          <Link
            to="/donors"
            className="text-sm text-primary font-medium hover:underline"
          >
            Browse Donors
          </Link>
          <Link
            to="/hospitals"
            className="text-sm text-primary font-medium hover:underline"
          >
            Browse Hospitals
          </Link>
          <Link
            to="/map"
            className="text-sm text-primary font-medium hover:underline"
          >
            Map
          </Link>
          <Link
            to="/leaderboard"
            className="text-sm text-primary font-medium hover:underline"
          >
            Leaderboard
          </Link>
          <Link
            to="/history"
            className="text-sm text-primary font-medium hover:underline"
          >
            View Donation History →
          </Link>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 flex justify-between items-center">
          <div>
            <p className="text-text font-medium">
              Blood Type: <span className="text-primary">{profile?.blood_type || 'Not set'}</span>
            </p>
            <p className="text-text-muted text-sm">
              City: {profile?.city || 'Not set'} · {profile?.total_donations ?? 0} total donation(s)
            </p>
            {profile && getBadges(profile.total_donations).length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {getBadges(profile.total_donations).map((badge) => (
                  <span
                    key={badge}
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_STYLES[badge]}`}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={toggling || (profile && !getEligibilityStatus(profile.last_donation_date).eligible)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-50 ${
              profile?.is_available
                ? 'bg-primary text-white'
                : 'bg-background text-text-muted border border-secondary/30'
            }`}
          >
            {profile?.is_available ? 'Available' : 'Unavailable'}
          </button>
        </div>

        {/* Search radius preference */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <p className="text-sm font-medium text-text mb-3">Match Radius</p>
          <p className="text-xs text-text-muted mb-3">
            Only show me requests within this distance
          </p>
          <div className="flex gap-2">
            {[5, 10, 25, 50].map((km) => (
              <button
                key={km}
                onClick={async () => {
                  if (!profile) return
                  try {
                    const updated = await updateDonorProfile({ max_distance_km: km })
                    setProfile(updated)
                  } catch (err) {
                    setError(err.message)
                  }
                }}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  profile?.max_distance_km === km
                    ? 'bg-primary text-white'
                    : 'bg-background text-text-muted border border-secondary/30'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>
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
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setHealthCheckTarget({ id: req.id, action: 'accept' })}
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
                  <button
                    onClick={() => toggleThread(req.id)}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {openThreadId === req.id ? 'Hide Messages' : `Message ${req.hospital_name}`}
                  </button>
                  {openThreadId === req.id && (
                    <MessageThread bloodRequestId={req.id} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accepted matches - can message the hospital or change their mind */}
        {acceptedMatches.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text mb-3">Your Accepted Matches</h2>
            <div className="space-y-3">
              {acceptedMatches.map((req) => (
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

                  <div className="flex items-center gap-4 flex-wrap mb-1">
                    <button
                      onClick={() => toggleThread(req.id)}
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      {openThreadId === req.id ? 'Hide Messages' : `Message ${req.hospital_name}`}
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      disabled={actingOn === req.id}
                      className="text-sm text-critical font-medium hover:underline disabled:opacity-50"
                    >
                      {actingOn === req.id ? 'Working...' : "Can't donate anymore"}
                    </button>
                  </div>

                  {openThreadId === req.id && (
                    <MessageThread bloodRequestId={req.id} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open requests */}
        <h2 className="text-lg font-semibold text-text mb-3">Open Requests</h2>
        {sortedRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center text-text-muted">
            No open requests right now.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRequests.map((req) => {
              const expiry = getRequestExpiry(req)
              const isNew = !seenRequestIds.has(req.id)
              const matchesBloodType = req.blood_type === profile?.blood_type
              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl shadow-md p-5 ${
                    expiry.isExpiringSoon || expiry.isExpired
                      ? 'border-2 border-red-400'
                      : matchesBloodType
                        ? 'border-2 border-primary/40'
                        : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-semibold text-primary">{req.blood_type}</span>
                      {isNew && (
                        <span className="bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                      {expiry.isExpired && (
                        <span className="bg-gray-800 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          Expired
                        </span>
                      )}
                      {expiry.isExpiringSoon && !expiry.isExpired && (
                        <span className="bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
                          Expiring soon
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full capitalize border ${URGENCY_STYLES[req.urgency] || 'bg-gray-100 text-gray-600 border-gray-300'}`}
                    >
                      {req.urgency}
                    </span>
                  </div>

                  <div className="text-sm text-text-muted mb-1">
                    {req.units_needed} unit{req.units_needed > 1 ? 's' : ''} · {req.city} · {req.hospital_name}
                  </div>

                  {req.notes && <p className="text-sm text-text-muted mb-2">{req.notes}</p>}

                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className={`text-xs font-medium ${
                        expiry.isExpired ? 'text-gray-500' :
                        expiry.isExpiringSoon ? 'text-red-600' : 'text-text-muted'
                      }`}>
                        {expiry.display}
                      </p>
                      {matchesBloodType && (
                        <p className="text-xs text-primary font-medium mt-0.5">
                          Matches your blood type
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setHealthCheckTarget({ id: req.id, action: 'volunteer' })}
                      disabled={actingOn === req.id || !profile?.is_available || expiry.isExpired}
                      className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
                    >
                      {actingOn === req.id ? 'Working...' : 'Volunteer'}
                    </button>
                  </div>

                  <p className="text-xs text-text-muted mt-1 text-right">
                    {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {healthCheckTarget && (
        <HealthCheckModal
          title={healthCheckTarget.action === 'accept' ? 'Confirm before accepting' : 'Confirm before volunteering'}
          submitting={actingOn === healthCheckTarget.id}
          onCancel={() => setHealthCheckTarget(null)}
          onConfirm={(answers) => {
            if (healthCheckTarget.action === 'accept') {
              handleAccept(healthCheckTarget.id, answers)
            } else {
              handleVolunteer(healthCheckTarget.id, answers)
            }
          }}
        />
      )}
    </div>
  )
}

export default DonorDashboard
