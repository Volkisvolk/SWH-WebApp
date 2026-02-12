// RFID Cache: speichert die letzte gescannte UID

let lastRfidEvent = null

/**
 * Speichert ein neues RFID-Event im Cache
 * @param {Object} event - Das RFID-Event
 * @param {string} event.uid - Die RFID-UID
 * @param {string} event.eventType - Event-Typ: 'LOGIN'
 * @param {number} [event.timestamp] - Unix-Zeitstempel (auto-generiert)
 */
function storeRfidEvent(event) {
  const newUid = event.uid ? event.uid.trim() : null
  
  lastRfidEvent = {
    uid: newUid,
    eventType: event.eventType || 'LOGIN',
    timestamp: event.timestamp || Date.now()
  }
  console.log(`[RFID Cache] UID gespeichert: ${lastRfidEvent.uid || 'N/A'}`)
}

/**
 * Gibt das letzte RFID-Event zurück
 * @returns {Object|null} Das Event-Objekt oder null
 */
function getLatestRfidEvent() {
  return lastRfidEvent
}

/**
 * Gibt die letzte gescannte UID zurück
 * @returns {string|null} Die UID oder null
 */
function getLatestRfidUid() {
  return lastRfidEvent ? lastRfidEvent.uid : null
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
