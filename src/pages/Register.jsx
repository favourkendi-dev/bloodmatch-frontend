import { useState } from 'react'
import { Link } from 'react-router-dom'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function Register() {
  const [role, setRole] = useState('donor')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodType: '',
    registrationNo: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    //  logging 
    console.log('Register submitted:', { role, ...formData })
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

        {/* Role toggle */}
        <div className="flex bg-background rounded-full p-1 mb-6">
          <button
            type="button"
            onClick={() => setRole('donor')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
              role === 'donor'
                ? 'bg-primary text-white'
                : 'text-text-muted'
            }`}
          >
            Donor
          </button>
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
              role === 'hospital'
                ? 'bg-primary text-white'
                : 'text-text-muted'
            }`}
          >
            Hospital
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text mb-1">
              {role === 'hospital' ? 'Hospital Name' : 'Full Name'}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={role === 'hospital' ? 'St. Mary Hospital' : 'Jane Doe'}
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
              className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {role === 'donor' && (
            <>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+254 700 000000"
                />
              </div>

              <div>
                <label htmlFor="bloodType" className="block text-sm font-medium text-text mb-1">
                  Blood Type
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>
                    Select blood type
                  </option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {role === 'hospital' && (
            <div>
              <label htmlFor="registrationNo" className="block text-sm font-medium text-text mb-1">
                Registration / License Number
              </label>
              <input
                type="text"
                id="registrationNo"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-secondary/30 px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. KMPDC-12345"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white font-medium py-2 rounded-full hover:opacity-90 transition"
          >
            Create Account
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
