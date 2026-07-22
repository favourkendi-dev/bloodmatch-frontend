import { useAuth } from '../context/AuthContext'
import DonorDashboard from './DonorDashboard'
import HospitalDashboard from './HospitalDashboard'

function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'hospital') {
    return <HospitalDashboard />
  }

  return <DonorDashboard />
}

export default Dashboard
