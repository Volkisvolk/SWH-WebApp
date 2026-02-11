// RFID Cache: speichert die letzte gescannte UID mit Zeitstempel und Event-Typ (5 Sekunden Gültigkeitsdauer)

let lastRfidEvent = null
const CACHE_DURATION_MS = 5000 // 5 Sekunden

/**
 * Speichert ein neues RFID-Event im Cache
 * @param {Object} event - Das RFID-Event
 * @param {string} event.uid - Die RFID-UID (für LOGIN/LOGOUT)
 * @param {string} event.eventType - Event-Typ: 'LOGIN', 'LOGOUT', 'STATUS'
 * @param {string} [event.color] - LED-Farbe (nur für STATUS-Events)
 * @param {number} [event.timestamp] - Unix-Zeitstempel (auto-generiert)
 */
function storeRfidEvent(event) {
  lastRfidEvent = {
    uid: event.uid ? event.uid.trim() : null,
    eventType: event.eventType || 'LOGIN',
    timestamp: event.timestamp || Date.now(),
    color: event.color || null
  }
  console.log(`[RFID Cache] Event gespeichert: ${lastRfidEvent.eventType} - UID: ${lastRfidEvent.uid || 'N/A'}`)
}

/**
 * Gibt das letzte RFID-Event zurück, falls noch gültig (< 5 Sekunden alt)
 * @returns {Object|null} Das Event-Objekt oder null, falls nicht vorhanden/abgelaufen
 */
function getLatestRfidEvent() {
  if (!lastRfidEvent) return null
  
  const age = Date.now() - lastRfidEvent.timestamp
  if (age > CACHE_DURATION_MS) {
    lastRfidEvent = null
    return null
  }
  
  return lastRfidEvent
}

/**
 * Gibt die letzte gescannte UID zurück (Rückwärtskompatibilität)
 * @returns {string|null} Die UID oder null
 */
function getLatestRfidUid() {
  const event = getLatestRfidEvent()
  return event && event.eventType === 'LOGIN' ? event.uid : null
}

/**
 * Löscht den Cache (z.B. nach erfolgreicher Verwendung)
 */
function clearRfidCache() {
  lastRfidEvent = null
}

module.exports = {
  storeRfidEvent,
  storeRfidUid: (uid) => storeRfidEvent({ uid, eventType: 'LOGIN' }), // Rückwärtskompatibilität
  getLatestRfidEvent,
  getLatestRfidUid,
  clearRfidCache
}
