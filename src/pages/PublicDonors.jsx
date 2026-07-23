import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'

function PublicDonors() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest('/donors/', { auth: false })
        setDonors(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted">Loading donors...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-text">Available Donors</h1>
          <Link to="/dashboard" className="text-sm text-primary font-medium hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        {donors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center text-text-muted">
            No available donors right now.
          </div>
        ) : (
          <div className="space-y-3">
            {donors.map((donor) => (
              <div key={donor.id} className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-text">{donor.username}</p>
                    <p className="text-sm text-text-muted">
                      Blood Type: <span className="text-primary font-medium">{donor.blood_type}</span>
                      {' · '}{donor.city || 'No city set'}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {donor.total_donations ?? 0} donation{donor.total_donations !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PublicDonors
