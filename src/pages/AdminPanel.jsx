import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  listAdminHospitals,
  verifyHospital,
  listAdminDonors,
  listAdminRequests,
  adminCancelRequest,
  getAdminReports,
} from '../lib/api'

const TABS = ['Hospitals', 'Donors', 'Requests', 'Reports']

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Hospitals')
  const [hospitals, setHospitals] = useState([])
  const [donors, setDonors] = useState([])
  const [requests, setRequests] = useState([])
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadHospitals = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await listAdminHospitals()
      setHospitals(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDonors = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await listAdminDonors()
      setDonors(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadRequests = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await listAdminRequests()
      setRequests(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadReports = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await getAdminReports()
      setReports(data)
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
      if (activeTab === 'Hospitals') await loadHospitals()
      else if (activeTab === 'Donors') await loadDonors()
      else if (activeTab === 'Requests') await loadRequests()
      else if (activeTab === 'Reports') await loadReports()
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [activeTab, loadHospitals, loadDonors, loadRequests, loadReports])

  const handleVerify = async (id) => {
    try {
      await verifyHospital(id)
      loadHospitals()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this request?')) return
    try {
      await adminCancelRequest(id)
      loadRequests()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-text">Admin Panel</h1>
          <Link to="/dashboard" className="text-sm text-primary font-medium hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-muted border border-secondary/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && <p className="text-text-muted">Loading...</p>}

        {/* Hospitals */}
        {!loading && activeTab === 'Hospitals' && (
          <div className="space-y-3">
            {hospitals.length === 0 ? (
              <p className="text-text-muted">No hospitals found.</p>
            ) : (
              hospitals.map((h) => (
                <div key={h.id} className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-text">{h.hospital_name}</p>
                    <p className="text-sm text-text-muted">{h.city} · {h.registration_no}</p>
                    <p className="text-xs text-text-muted mt-1">
                      User: {h.username} · {h.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full ${
                        h.is_verified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {h.is_verified ? 'Verified' : 'Pending'}
                    </span>
                    {!h.is_verified && (
                      <button
                        onClick={() => handleVerify(h.id)}
                        className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-full hover:opacity-90 transition"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Donors */}
        {!loading && activeTab === 'Donors' && (
          <div className="space-y-3">
            {donors.length === 0 ? (
              <p className="text-text-muted">No donors found.</p>
            ) : (
              donors.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl shadow-md p-5">
                  <p className="font-medium text-text">
                    {d.username} · {d.blood_type}
                  </p>
                  <p className="text-sm text-text-muted">
                    {d.city} · {d.total_donations} donation{d.total_donations !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Available: {d.is_available ? 'Yes' : 'No'} · Last donation: {d.last_donation_date || 'Never'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Requests */}
        {!loading && activeTab === 'Requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-text-muted">No requests found.</p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-text">
                      {r.blood_type} · {r.units_needed} unit{r.units_needed > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-text-muted">
                      {r.hospital_name} · {r.city}
                    </p>
                    <p className="text-xs text-text-muted mt-1 capitalize">
                      {r.urgency} · {r.status.replace('_', ' ')}
                    </p>
                  </div>
                  {r.status !== 'cancelled' && r.status !== 'fulfilled' && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="bg-red-50 text-red-600 text-xs font-medium px-4 py-2 rounded-full border border-red-200 hover:bg-red-100 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Reports */}
        {!loading && activeTab === 'Reports' && reports && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-primary">{reports.total_requests || 0}</p>
              <p className="text-xs text-text-muted">Total Requests</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{reports.total_donors || 0}</p>
              <p className="text-xs text-text-muted">Total Donors</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{reports.total_hospitals || 0}</p>
              <p className="text-xs text-text-muted">Total Hospitals</p>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{reports.fulfilled_requests || 0}</p>
              <p className="text-xs text-text-muted">Fulfilled</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
