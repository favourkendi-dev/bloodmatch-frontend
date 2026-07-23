import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'

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

function Leaderboard() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest('/donors/leaderboard/', { auth: true })
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
        <p className="text-text-muted">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-text">Leaderboard</h1>
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
            No donors on the leaderboard yet.
          </div>
        ) : (
          <div className="space-y-3">
            {donors.map((donor, index) => {
              const badges = getBadges(donor.total_donations)
              return (
                <div
                  key={donor.id}
                  className={`bg-white rounded-2xl shadow-md p-5 flex justify-between items-center ${
                    index === 0 ? 'border-2 border-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full ${
                        index === 0
                          ? 'bg-yellow-400 text-white'
                          : index === 1
                            ? 'bg-gray-300 text-white'
                            : index === 2
                              ? 'bg-orange-300 text-white'
                              : 'bg-gray-100 text-text-muted'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-text">{donor.username}</p>
                      <p className="text-xs text-text-muted">
                        {donor.total_donations} donation{donor.total_donations !== 1 ? 's' : ''} · {donor.blood_type}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {badges.map((badge) => (
                          <span
                            key={badge}
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${BADGE_STYLES[badge]}`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-sm font-medium text-yellow-600">Top Donor</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
