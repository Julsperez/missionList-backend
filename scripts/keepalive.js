/**
 * keepalive.js
 *
 * Hace un ping al backend para mantenerlo despierto en Render Free Tier.
 * Solo ejecuta el ping si la hora local está dentro de la ventana activa.
 *
 * Variables de entorno:
 *   BACKEND_URL   — URL base del backend, ej: https://mission-list-api.onrender.com
 *   KEEPALIVE_TZ  — Timezone IANA, default: America/Mexico_City
 *   ACTIVE_FROM   — Hora de inicio (inclusive), default: 10
 *   ACTIVE_TO     — Hora de fin (exclusive), default: 22
 */

const BACKEND_URL = process.env.BACKEND_URL?.replace(/\/$/, '')
const TZ          = process.env.KEEPALIVE_TZ  || 'America/Mexico_City'
const ACTIVE_FROM = parseInt(process.env.ACTIVE_FROM ?? '10', 10)
const ACTIVE_TO   = parseInt(process.env.ACTIVE_TO   ?? '22', 10)
const TIMEOUT_MS  = 15_000

if (!BACKEND_URL) {
  console.error('[keepalive] ERROR: BACKEND_URL is not set.')
  process.exit(1)
}

function localHour() {
  // Devuelve la hora (0-23) en el timezone configurado
  const str = new Date().toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false })
  return parseInt(str, 10)
}

async function main() {
  const now  = new Date()
  const hour = localHour()

  console.log(`[keepalive] ${now.toISOString()} | ${TZ} hour: ${hour}`)

  if (hour < ACTIVE_FROM || hour >= ACTIVE_TO) {
    console.log(`[keepalive] Outside active window (${ACTIVE_FROM}:00–${ACTIVE_TO}:00). Letting server sleep.`)
    process.exit(0)
  }

  const url = `${BACKEND_URL}/health`
  console.log(`[keepalive] Pinging ${url} …`)

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    const body = await res.text().catch(() => '')
    console.log(`[keepalive] ✓ ${res.status} ${res.statusText} — ${body.slice(0, 80)}`)

    if (!res.ok) {
      console.error(`[keepalive] Unexpected status: ${res.status}`)
      process.exit(1)
    }
  } catch (err) {
    console.error(`[keepalive] Ping failed: ${err.message}`)
    process.exit(1)
  }
}

main()
