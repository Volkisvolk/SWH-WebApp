// Optional bridge: read RFID tag from Arduino over serial and open login URL
// Usage: node server/src/index.js COM3
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const open = require('open')

const portName = process.argv[2] || process.env.SERIAL_PORT || 'COM3'
const base = process.env.APP_BASE || 'http://localhost:3001'

async function main() {
  const port = new SerialPort({ path: portName, baudRate: 9600 })
  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }))
  console.log('Listening on', portName)
  parser.on('data', async (line) => {
    const tag = (line || '').trim()
    if (!tag) return
    const url = `${base}/api/rfid-login?tagId=${encodeURIComponent(tag)}`
    console.log('RFID:', tag, '->', url)
    await open(url)
  })
}

main().catch(err => { console.error(err); process.exit(1) })
