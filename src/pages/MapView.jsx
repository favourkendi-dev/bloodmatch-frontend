import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listBloodRequests, getDonorProfile } from '../lib/api'

function MapView() {
  const { user } = useAuth()
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const [requests, setRequests] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isHospital = user?.role === 'hospital'

  useEffect(() => {
    const load = async () => {
      try {
        const [reqs, prof] = await Promise.all([
          listBloodRequests(),
          isHospital ? Promise.resolve(null) : getDonorProfile(),
        ])
        setRequests(reqs.filter(r => r.latitude && r.longitude))
        setProfile(prof)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isHospital])

  useEffect(() => {
    if (loading || !mapRef.current || leafletMap.current) return

    const map = window.L.map(mapRef.current).setView([-1.2921, 36.8219], 12)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap',
    }).addTo(map)

    leafletMap.current = map

    requests.forEach((req) => {
      const color = req.urgency === 'critical' ? 'red' : req.urgency === 'urgent' ? 'orange' : 'blue'
      const marker = window.L.circleMarker([req.latitude, req.longitude], {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map)

      marker.bindPopup(`
        <b>${req.blood_type}</b><br/>
        ${req.hospital_name}<br/>
        ${req.city}<br/>
        <span style="color:${color};text-transform:capitalize">${req.urgency}</span>
      `)
    })

    if (profile?.latitude && profile?.longitude) {
      window.L.marker([profile.latitude, profile.longitude])
        .addTo(map)
        .bindPopup('You are here')
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [loading, requests, profile])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-muted">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-text">Blood Requests Map</h1>
        <Link to="/dashboard" className="text-sm text-primary font-medium hover:underline">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mx-6 mb-4">
          {error}
        </p>
      )}

      <div className="px-6 pb-6">
        <div className="flex gap-4 mb-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Urgent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Normal
          </span>
        </div>
      </div>

      <div ref={mapRef} className="mx-6 rounded-2xl shadow-md" style={{ height: '500px' }} />
    </div>
  )
}

export default MapView
