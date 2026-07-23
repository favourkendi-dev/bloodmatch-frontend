import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listMyDonations } from '../lib/api'
import { calculateDonationStreak } from '../lib/utils'

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
  declined: 'bg-gray-100 text-gray-600',
}

function DonationHistory() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDonations = async () => {
      try {
        const data = await listMyDonations()
        setDonations(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDonations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted">Loading donation history...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-text mb-2">
          Donation History
        </h1>
        {donations.length > 0 && (() => {
          const streak = calculateDonationStreak(donations)
          return streak > 0 ? (
            <p className="text-sm text-primary font-medium mb-4">
              Current streak: {streak} month{streak > 1 ? 's' : ''} in a row
            </p>
          ) : null
        })()}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        {donations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-6 text-center text-text-muted">
            No donations yet. When you are matched and complete a donation, it will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl shadow-md p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-lg font-semibold text-primary">
                      {d.blood_type || 'Unknown type'}
                    </p>
                    <p className="text-text-muted text-sm">
                      {d.hospital_name || 'Unknown hospital'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${STATUS_STYLES[d.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {d.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-text-muted">
                  <span>{d.units_donated} unit{d.units_donated > 1 ? 's' : ''}</span>
                  <span>{new Date(d.donation_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DonationHistory
