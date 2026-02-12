// RFID Reader: Liest RFID-Karten vom Arduino und stellt UID via HTTP zur Verfügung
// Usage: node server/src/index.js COM4 (Windows) oder /dev/ttyACM0 (Linux)
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const http = require('http')
const { storeRfidEvent, getLatestRfidUid } = require('./rfidCache')

const portName = process.argv[2] || process.env.SERIAL_PORT || '/dev/ttyACM0'
const serverPort = process.env.SERVER_PORT || 3002

/**
 * Extrahiert die UID aus einer Zeile vom Arduino
 * Unterstützte Formate:
 * - "Card UID: ABC123DEF456"
 * - "ABC123DEF456" (direkt)
 */
function parseUidFromLine(line) {
  const trimmed = (line || '').trim()
  if (!trimmed) return null

  // Format: "Card UID: XYZ"
  const uidMatch = trimmed.match(/Card\s+UID:\s*(.+?)(?:\s*-|$)/i)
  if (uidMatch && uidMatch[1]) {
    return uidMatch[1].trim()
  }

  // Direkte UID (ohne Präfix)
  if (trimmed.length > 0 && trimmed.length < 50) {
    return trimmed
  }

  return null
}

// HTTP Server für API-Zugriff
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS')
  res.setHeader('Content-Type', 'application/json')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // GET /api/rfid/uid - Liefert die zuletzt gelesene UID
  if (req.url === '/api/rfid/uid' && req.method === 'GET') {
    const uid = getLatestRfidUid()
    res.writeHead(200)
    res.end(JSON.stringify({ uid }))
    return
  }

  // DELETE /api/rfid/uid - Löscht den Cache
  if (req.url === '/api/rfid/uid' && req.method === 'DELETE') {
    const { clearRfidCache } = require('./rfidCache')
    clearRfidCache()
    console.log('[RFID] Cache geleert')
    res.writeHead(200)
    res.end(JSON.stringify({ ok: true }))
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
    console.log(`[API] Endpoint: GET http://localhost:${serverPort}/api/rfid/uid`)
    
    parser.on('data', (line) => {
      const uid = parseUidFromLine(line)
      if (uid) {
        // Speichere als einfaches Event für Cache-Kompatibilität
        storeRfidEvent({ uid, eventType: 'LOGIN', timestamp: Date.now() })
        console.log(`[RFID] Karte gelesen: ${uid}`)
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
