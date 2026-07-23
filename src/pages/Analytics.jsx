import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getHospitalAnalytics } from '../lib/api'

function Analytics() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getHospitalAnalytics()
        setData(result)
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
        <p className="text-text-muted">Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600">{error}</p>
          <Link to="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const maxBloodType = Math.max(...Object.values(data.blood_type_demand || {}), 1)
  const maxMonth = Math.max(...(data.requests_per_month || []).map(m => m.count), 1)

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-text">Analytics</h1>
          <Link to="/dashboard" className="text-sm text-primary font-medium hover:underline">
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-primary">{data.total_requests}</p>
            <p className="text-xs text-text-muted">Total Requests</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{data.fulfillment_rate}%</p>
            <p className="text-xs text-text-muted">Fulfillment Rate</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{data.avg_time_to_match_hours}h</p>
            <p className="text-xs text-text-muted">Avg Time to Match</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{data.fulfilled}</p>
            <p className="text-xs text-text-muted">Fulfilled</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">Blood Type Demand</h2>
          <div className="space-y-3">
            {Object.entries(data.blood_type_demand || {}).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm font-medium w-10">{type}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${(count / maxBloodType) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-text-muted w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Requests Per Month</h2>
          <div className="flex items-end gap-4 h-40">
            {(data.requests_per_month || []).map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary rounded-t-lg transition-all"
                  style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: m.count > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-text-muted">{m.month}</span>
                <span className="text-xs font-medium">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
