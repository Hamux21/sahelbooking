// Lightweight Amadeus API client for browser usage via Vite
// Requires the following environment variables in .env.local:
// VITE_AMADEUS_CLIENT_ID, VITE_AMADEUS_CLIENT_SECRET, VITE_AMADEUS_HOST

const AMADEUS_HOST = import.meta.env.VITE_AMADEUS_HOST || import.meta.env.VITE_AMADEUS_BASE_URL || 'https://test.api.amadeus.com'
const CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID || import.meta.env.VITE_AMADEUS_KEY
const CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET || import.meta.env.VITE_AMADEUS_SECRET

let cachedAccessToken = null
let cachedExpiryEpochMs = 0

async function getAccessToken() {
  const now = Date.now()
  if (cachedAccessToken && now < cachedExpiryEpochMs - 10_000) {
    return cachedAccessToken
  }

  console.log('CLIENT_ID set:', !!CLIENT_ID)
  console.log('CLIENT_SECRET set:', !!CLIENT_SECRET)
  console.log('AMADEUS_HOST:', AMADEUS_HOST)

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })

  const resp = await fetch(`${AMADEUS_HOST}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Auth failed: ${resp.status} ${text}`)
  }

  const json = await resp.json()
  cachedAccessToken = json.access_token
  cachedExpiryEpochMs = now + (json.expires_in || 0) * 1000
  return cachedAccessToken
}

async function authorizedFetch(path, params = {}) {
  const token = await getAccessToken()
  const url = new URL(`${AMADEUS_HOST}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  })
  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(`Request failed ${resp.status}: ${text}`)
  }
  return resp.json()
}

export async function searchLocations(keyword) {
  const data = await authorizedFetch('/v1/reference-data/locations', {
    keyword,
    subType: 'CITY,AIRPORT',
  })
  return data?.data || []
}

async function searchCities(keyword) {
  const data = await authorizedFetch('/v1/reference-data/locations/cities', {
    keyword,
  })
  return data?.data || []
}

export async function resolveIataCode(input) {
  // If user already provided a 3-letter IATA code, accept it
  if (typeof input === 'string' && input.trim().length === 3) {
    return input.trim().toUpperCase()
  }

  // Extract IATA code from input if it's in the format "City (CODE)"
  const codeMatch = input.match(/\(([^)]+)\)$/)
  if (codeMatch && codeMatch[1].trim().length === 3) {
    return codeMatch[1].trim().toUpperCase()
  }

  const results = await searchLocations(input)
  // Prefer city codes over airports if available
  const city = results.find((r) => r.subType === 'CITY')
  if (city?.iataCode) return city.iataCode
  const airport = results.find((r) => r.subType === 'AIRPORT')
  if (airport?.iataCode) return airport.iataCode
  // Fallback: query cities endpoint directly
  const cityOnly = await searchCities(input)
  const city2 = cityOnly.find((r) => r.iataCode)
  if (city2?.iataCode) return city2.iataCode
  throw new Error(`No IATA code found for "${input}"`)
}

export async function searchFlights({ from, to, date, returnDate, adults = 1, currencyCode = 'USD', max = 10, travelClass = 'ECONOMY' }) {
  const originLocationCode = await resolveIataCode(from)
  const destinationLocationCode = await resolveIataCode(to)

  const data = await authorizedFetch('/v2/shopping/flight-offers', {
    originLocationCode,
    destinationLocationCode,
    departureDate: date,
    returnDate,
    adults,
    currencyCode,
    travelClass,
    max,
  })
  return data?.data || []
}

export function envReady() {
  return Boolean(CLIENT_ID && CLIENT_SECRET && AMADEUS_HOST)
}

export function missingEnvVars() {
  const missing = []
  if (!CLIENT_ID) missing.push('VITE_AMADEUS_CLIENT_ID')
  if (!CLIENT_SECRET) missing.push('VITE_AMADEUS_CLIENT_SECRET')
  if (!AMADEUS_HOST) missing.push('VITE_AMADEUS_HOST')
  return missing
}


