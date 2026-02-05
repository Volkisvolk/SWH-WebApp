// RFID Cache: speichert die letzte gescannte UID mit Zeitstempel (5 Sekunden Gültigkeitsdauer)

let lastScannedRfid = null
const CACHE_DURATION_MS = 5000 // 5 Sekunden

/**
 * Speichert eine neu gescannte UID im Cache
 * @param {string} uid - Die RFID-UID
 */
function storeRfidUid(uid) {
  lastScannedRfid = {
    uid: uid.trim(),
    timestamp: Date.now()
  }
  console.log(`[RFID Cache] UID gespeichert: ${uid}`)
}

/**
 * Gibt die letzte gescannte UID zurück, falls noch gültig (< 5 Sekunden alt)
 * @returns {string|null} Die UID oder null, falls nicht vorhanden/abgelaufen
 */
function getLatestRfidUid() {
  if (!lastScannedRfid) return null
  
  const age = Date.now() - lastScannedRfid.timestamp
  if (age > CACHE_DURATION_MS) {
    lastScannedRfid = null
    return null
  }
  
  return lastScannedRfid.uid
}

/**
 * Löscht den Cache (z.B. nach erfolgreicher Verwendung)
 */
function clearRfidCache() {
  lastScannedRfid = null
}

module.exports = {
  storeRfidUid,
  getLatestRfidUid,
  clearRfidCache
}
