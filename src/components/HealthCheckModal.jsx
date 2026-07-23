import { useState } from 'react'

const QUESTIONS = [
  { key: 'feeling_well', label: 'I am currently feeling well (no fever, cold, or flu)' },
  { key: 'no_recent_tattoo_or_piercing', label: 'I have not had a tattoo or piercing in the last 6 months' },
  { key: 'no_recent_travel_risk', label: 'I have not recently traveled somewhere with malaria risk' },
  { key: 'not_on_medication', label: 'I am not currently on medication or recent antibiotics' },
  { key: 'meets_weight_minimum', label: 'I weigh at least 50kg' },
]

function HealthCheckModal({ title, onConfirm, onCancel, submitting }) {
  const [answers, setAnswers] = useState(
    QUESTIONS.reduce((acc, q) => ({ ...acc, [q.key]: false }), {})
  )

  const allChecked = QUESTIONS.every((q) => answers[q.key])

  const toggle = (key) => {
    setAnswers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
        <p className="text-sm text-text-muted mb-4">
          Please confirm the following before continuing. This is a self-declared
          check, not a medical clearance — the hospital will still screen you on-site.
        </p>

        <div className="space-y-3 mb-5">
          {QUESTIONS.map((q) => (
            <label key={q.key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={answers[q.key]}
                onChange={() => toggle(q.key)}
                className="mt-1"
              />
              <span className="text-sm text-text">{q.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(answers)}
            disabled={!allChecked || submitting}
            className="flex-1 bg-primary text-white text-sm font-medium py-2 rounded-full hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 bg-background text-text-muted text-sm font-medium py-2 rounded-full border border-secondary/30 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default HealthCheckModal
