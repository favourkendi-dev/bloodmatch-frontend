import { useAuth } from '../context/AuthContext'

function HospitalDashboard() {
  const { user, logout } = useAuth()

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

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-primary mb-2">Hospital Dashboard</h2>
          <p className="text-text-muted">
            Blood requests, matched donors, and verification status will show up here.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HospitalDashboard
