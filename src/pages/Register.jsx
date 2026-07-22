import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../lib/api'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('donor')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone_number: '',
    blood_type: '',
    hospital_name: '',
    registration_no: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role,
        phone_number: formData.phone_number,
      }

      if (role === 'donor') {
        payload.blood_type = formData.blood_type
      } else {
        payload.hospital_name = formData.hospital_name
        payload.registration_no = formData.registration_no
      }

      await registerUser(payload)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-text text-center mb-2">
          Create an Account
        </h1>
        <p className="text-text-muted text-center mb-6">
          Join BloodMatch as a donor or a hospital
        </p>

        <div className="flex bg-background rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
              role === 'donor' ? 'bg-primary text-white' : 'text-text-muted'
            }`}
          >
            Donor
          </button>
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
              role === 'hospital' ? 'bg-primary text-white' : 'text-text-muted'
            }`}
          >
            Hospital
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={role === 'hospital' ? 'stmary_hospital' : 'jane_doe'}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-text mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+254 700 000000"
            />
          </div>

          {role === 'donor' && (
            <div>
              <label htmlFor="blood_type" className="block text-sm font-medium text-text mb-1">
                Blood Type
              </label>
              <select
                id="blood_type"
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="" disabled>Select blood type</option>
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          {role === 'hospital' && (
            <>
              <div>
                <label htmlFor="hospital_name" className="block text-sm font-medium text-text mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  id="hospital_name"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="St. Mary Hospital"
                />
              </div>

              <div>
                <label htmlFor="registration_no" className="block text-sm font-medium text-text mb-1">
                  Registration / License Number
                </label>
                <input
                  type="text"
                  id="registration_no"
                  name="registration_no"
                  value={formData.registration_no}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. KMPDC-12345"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-medium py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-text-muted text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
