const EXPIRY_HOURS = {
  critical: 6,
  urgent: 12,
  normal: 24,
}

export function getRequestExpiry(request) {
  const created = new Date(request.created_at)
  const hours = EXPIRY_HOURS[request.urgency] || 24
  const expiresAt = new Date(created.getTime() + hours * 60 * 60 * 1000)
  const now = new Date()
  const msLeft = expiresAt - now
  const minutesLeft = Math.ceil(msLeft / (1000 * 60))
  const hoursLeft = Math.floor(minutesLeft / 60)
  const mins = minutesLeft % 60

  return {
    expiresAt,
    minutesLeft,
    isExpired: minutesLeft <= 0,
    isExpiringSoon: minutesLeft > 0 && minutesLeft <= 60,
    display:
      minutesLeft <= 0
        ? 'Expired'
        : hoursLeft > 0
          ? `${hoursLeft}h ${mins}m left`
          : `${mins}m left`,
  }
}

export function sortRequestsByUrgency(requests, donorBloodType) {
  const urgencyOrder = { critical: 0, urgent: 1, normal: 2 }
  return [...requests].sort((a, b) => {
    // Priority 1: matching blood type
    const aMatches = a.blood_type === donorBloodType
    const bMatches = b.blood_type === donorBloodType
    if (aMatches !== bMatches) {
      return aMatches ? -1 : 1
    }

    // Priority 2: not expired
    const aExpiry = getRequestExpiry(a)
    const bExpiry = getRequestExpiry(b)
    if (aExpiry.isExpired !== bExpiry.isExpired) {
      return aExpiry.isExpired ? 1 : -1
    }

    // Priority 3: urgency
    if (a.urgency !== b.urgency) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    }

    // Priority 4: time remaining
    return aExpiry.minutesLeft - bExpiry.minutesLeft
  })
}

export function calculateDonationStreak(donations) {
  if (!donations || donations.length === 0) return 0

  const sorted = [...donations].sort((a, b) => new Date(b.donation_date) - new Date(a.donation_date))
  const completed = sorted.filter((d) => d.status === 'completed')

  if (completed.length === 0) return 0

  let streak = 1
  for (let i = 1; i < completed.length; i++) {
    const prev = new Date(completed[i - 1].donation_date)
    const curr = new Date(completed[i].donation_date)

    const prevMonth = prev.getFullYear() * 12 + prev.getMonth()
    const currMonth = curr.getFullYear() * 12 + curr.getMonth()

    if (prevMonth - currMonth === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}
