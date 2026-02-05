// Optional bridge: read RFID tag from Arduino over serial
// Usage: node server/src/index.js /dev/ttyACM0
// Die UIDs werden für die Next.js App verfügbar gemacht via HTTP-API
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const http = require('http')
const { storeRfidUid, getLatestRfidUid } = require('./rfidCache')

const portName = process.argv[2] || process.env.SERIAL_PORT || '/dev/ttyACM0'
const serverPort = process.env.SERVER_PORT || 3002

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
    
    parser.on('data', (line) => {
      const trimmed = (line || '').trim()
      if (!trimmed) return
      
      // Extrahiere UID aus "Card UID: ABC123" Format
      if (trimmed.includes('Card UID:') || trimmed.includes('UID:')) {
        const match = trimmed.match(/UID:\s*(.+)/)
        if (match && match[1]) {
          const uid = match[1].trim()
          storeRfidUid(uid)
          console.log(`[RFID] UID erfasst und gecacht: ${uid}`)
        }
      } else {
        // Fallback: gesamte Zeile als UID verwenden
        storeRfidUid(trimmed)
        console.log(`[RFID] Line erfasst: ${trimmed}`)
      }
    })

    port.on('error', (err) => {
      console.error(`[RFID] Port-Fehler: ${err.message}`)
    })

    // HTTP Server starten
    server.listen(serverPort, () => {
      console.log(`[API] Bereit für Anfragen auf http://localhost:${serverPort}/api/rfid/latest`)
    })
  } catch (err) {
    console.error(`[Error] ${err.message}`)
    process.exit(1)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
