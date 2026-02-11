// Optional bridge: read RFID tag from Arduino over serial
// Usage: node server/src/index.js /dev/ttyACM0
// Die Events werden für die Next.js App verfügbar gemacht via HTTP-API
// Unterstützte Events: LOGIN (Card UID), LOGOUT (Card removed), STATUS (LED Color)
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const http = require('http')
const { storeRfidEvent, getLatestRfidEvent, getLatestRfidUid } = require('./rfidCache')

const portName = process.argv[2] || process.env.SERIAL_PORT || '/dev/ttyACM0'
const serverPort = process.env.SERVER_PORT || 3002

/**
 * Parst eine Zeile vom Arduino und extrahiert das RFID-Event
 * Unterstützte Formate:
 * - "Card UID: ABC123DEF456" → LOGIN-Event
 * - "Card removed - User logged out" → LOGOUT-Event
 * - "LED Color: Red" → STATUS-Event (optional)
 */
function parseRfidLine(line) {
  const trimmed = (line || '').trim()
  if (!trimmed) return null

  // LOGIN-Event: "Card UID: XYZ"
  const uidMatch = trimmed.match(/Card\s+UID:\s*(.+?)(?:\s*-|$)/i)
  if (uidMatch && uidMatch[1]) {
    return {
      uid: uidMatch[1].trim(),
      eventType: 'LOGIN',
      timestamp: Date.now()
    }
  }

  // LOGOUT-Event: "Card removed" oder "User logged out"
  if (trimmed.match(/Card.*removed|logged\s*out/i)) {
    return {
      eventType: 'LOGOUT',
      timestamp: Date.now()
    }
  }

  // STATUS-Event: "LED Color: Red"
  const ledMatch = trimmed.match(/LED\s+Color:\s*(.+?)(?:\s*-|$)/i)
  if (ledMatch && ledMatch[1]) {
    return {
      eventType: 'STATUS',
      color: ledMatch[1].trim(),
      timestamp: Date.now()
    }
  }

  // Fallback: if no format matched, treat as LOGIN with full line as UID
  if (trimmed.length > 0 && trimmed.length < 50) {
    return {
      uid: trimmed,
      eventType: 'LOGIN',
      timestamp: Date.now()
    }
  }

  return null
}

// HTTP Server für API-Zugriff
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Neuer Endpoint: /api/rfid/event (liefert vollständiges Event-Objekt)
  if (req.url === '/api/rfid/event' && req.method === 'GET') {
    const event = getLatestRfidEvent()
    res.writeHead(200)
    res.end(JSON.stringify(event || {}))
    return
  }

  // Alter Endpoint (Rückwärtskompatibilität): /api/rfid/latest (nur UID)
  if (req.url === '/api/rfid/latest' && req.method === 'GET') {
    const uid = getLatestRfidUid()
    res.writeHead(200)
    res.end(JSON.stringify({ uid }))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
})

async function main() {
  try {
    const port = new SerialPort({ path: portName, baudRate: 9600 })
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
    
    console.log(`[RFID] Listening on ${portName} at 9600 Baud`)
    console.log(`[API] Server started on http://localhost:${serverPort}`)
    console.log(`[API] Endpoints:`)
    console.log(`      - GET http://localhost:${serverPort}/api/rfid/event (neuer Event-Endpoint)`)
    console.log(`      - GET http://localhost:${serverPort}/api/rfid/latest (Legacy UID-Endpoint)`)
    
    parser.on('data', (line) => {
      const event = parseRfidLine(line)
      if (event) {
        storeRfidEvent(event)
      }
    })

    port.on('error', (err) => {
      console.error(`[RFID] Port-Fehler: ${err.message}`)
    })

    // HTTP Server starten
    server.listen(serverPort, () => {
      console.log(`[API] Bereit für Anfragen`)
    })
  } catch (err) {
    console.error(`[Error] ${err.message}`)
    process.exit(1)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
