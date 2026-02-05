# RFID-Login Integration - Anleitung

Diese Anleitung beschreibt die RFID-Login-Integration für die BeeApp.

## Hardware-Setup

### Anforderungen
- **Arduino-kompatibles Board** (z.B. Arduino Uno, Nano, Pro Micro)
- **RFID RC522 Modul**
- **USB-Kabel** zur Verbindung mit dem PC
- **RFID-Karten** zum Scannen

### Anschlüsse (Arduino → RC522)
```
Arduino Pin 10 → RC522 SDA
Arduino Pin 11 → RC522 MOSI
Arduino Pin 12 → RC522 MISO
Arduino Pin 13 → RC522 SCK
Arduino Pin 8  → RC522 RST
5V → RC522 VCC
GND → RC522 GND
```

### Arduino-Code (Beispiel mit MFRC522 Library)

```cpp
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 10
#define RST_PIN 8

MFRC522 rfid(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
}

void loop() {
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    // Gib die UID aus
    Serial.print("Card UID: ");
    for (byte i = 0; i < rfid.uid.size; i++) {
      if (rfid.uid.uidByte[i] < 0x10) Serial.print("0");
      Serial.print(rfid.uid.uidByte[i], HEX);
    }
    Serial.println();
    
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
  delay(500);
}
```

**Serial-Einstellungen:**
- **Baud Rate:** 9600
- **Data Bits:** 8
- **Stop Bits:** 1
- **Parity:** None

## Software-Setup

### 1. Serial-Reader-Service starten (Backend-Bridge)

Der Serial-Reader läuft als Node.js-Service im `/server` Verzeichnis.

```bash
cd server
node src/index.js /dev/ttyACM0
```

**Umgebungsvariablen:**
- `SERIAL_PORT=/dev/ttyACM0` - Der Serial-Port (Standard: /dev/ttyACM0)
  - Linux: `/dev/ttyACM0`, `/dev/ttyUSB0`
  - Windows: `COM3`, `COM4`
- `SERVER_PORT=3002` - Der HTTP-Server-Port (Standard: 3002)

Der Service:
- Liest RFID-UIDs vom Arduino über Serial (9600 Baud)
- Cached die letzte UID für 5 Sekunden
- Stellt einen HTTP-Endpoint zur Verfügung: `http://localhost:3002/api/rfid/latest`

**Wichtig:** Nur ein Prozess darf den Serial-Port nutzen. Der Serial Monitor der Arduino IDE muss geschlossen sein.

### 2. Next.js App starten

```bash
npm run dev
```

Die App läuft auf `http://localhost:3000`.

## Verwendung

### 1. Login-Seite

**URL:** `http://localhost:3000`

Zwei Login-Methoden:
1. **RFID-Scan:** Klick auf "📱 Mit RFID einloggen" → Karte scannen (30 Sekunden Timeout)
2. **Manuell:** Klick auf "Manuell eingeben" → Tag-ID eingeben (zum Debuggen)

### 2. Registrierung

**URL:** `http://localhost:3000/register`

- Scan die Karte oder gib die UID manuell ein
- Gib deinen Namen ein
- Klick "Registrieren"

Die UID wird in der Whitelist gespeichert.

### 3. Admin-RFID-Verwaltung

**URL:** `http://localhost:3000/admin/rfid`

Nur für Admin-User verfügbar. Hier können:
- Neue RFID-Karten registriert werden
- Karten zu Usern zugeordnet werden
- Karten gelöscht werden
- UID durch Scan oder manuelle Eingabe hinzugefügt werden

## Datenbankstruktur

### RFID-Cards (`rfidCards`)

```json
{
  "uid": "ABC123DEF456",
  "userId": 1,
  "registeredAt": "2025-01-30T10:30:00Z"
}
```

## API-Endpoints

### Scanner-Bridge (Port 3002)

**GET /api/rfid/latest**
```json
{ "uid": "ABC123" }
```
Gibt die letzte gescannte UID zurück (< 5 Sekunden alt) oder `null`.

### Login-API (Port 3000)

**POST /api/rfid/login**
```json
{
  "ok": true,
  "uid": "ABC123",
  "user": { "id": 1, "name": "Volkan", "role": "admin" }
}
```
Liest UID vom Scanner, sucht User, erstellt Session.

### RFID-Verwaltung (Port 3000)

**GET /api/rfid/cards** - Alle Karten (Admin-only)
**GET /api/rfid/cards?userId=1** - Karten eines Users

**POST /api/rfid/cards**
```json
{
  "uid": "ABC123",
  "userId": 1
}
```
Registriert eine neue RFID-Karte.

**DELETE /api/rfid/cards?uid=ABC123** - Karte löschen (Admin-only)

## Troubleshooting

### Serial-Port nicht erreichbar
```
Error: Port is busy or doesn't exist
```
**Lösung:**
1. Arduino IDE geschlossen? → Ja, aber noch offen?
2. COM-Port korrekt? → Überprüf im Device Manager
3. Baud Rate 9600? → Überprüf Arduino-Code
4. Andere Prozesse auf COM-Port? → Reboot oder neuen Port

### "Serial-Reader nicht erreichbar"
```
Error: Serial-Reader nicht erreichbar
```
**Lösung:**
1. Stelle sicher, dass `node server/src/index.js /dev/ttyACM0` läuft
2. Überprüf Port 3002 in den Firewall-Einstellungen
3. Überprüf die Logs des Servers
4. Linux: Stelle sicher, dass dein Benutzer in der Gruppe `dialout` ist: `sudo usermod -a -G dialout $USER`

### UIDs nicht gescannt
**Überprüfung:**
1. Arduino IDE → Serial Monitor öffnen (9600 Baud)
2. Karte scannen → "Card UID: ABC123..." sollte angezeigt werden
3. Wenn nichts: RC522-Anschlüsse überprüfen

### Karte wird nicht akzeptiert
```
Error: RFID-Karte ist nicht registriert
```
**Lösung:**
1. Gehe zu `/admin/rfid`
2. Registriere die neue Karte mit einem User

## Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## Dateien überblick

- **Backend:**
  - `server/src/index.js` - Serial-Reader + HTTP-Server
  - `server/src/rfidCache.js` - UID-Cache (5 Sekunden)

- **Frontend:**
  - `src/app/api/rfid/login/route.ts` - Login-Endpoint
  - `src/app/api/rfid/cards/route.ts` - Card-Verwaltungs-API
  - `src/components/RfidLoginButton.tsx` - Login-Button-Komponente
  - `src/app/admin/rfid/page.tsx` - Admin-Panel für RFID-Verwaltung

- **Datenbank:**
  - `data/db.json` - JSON-Datei mit rfidCards-Array

## Sicherheit

- UIDs sind nicht verschlüsselt (nur Base64 im Transit)
- Verwende HTTPS in Produktion
- Admin-Zugriff mit JWT-Token geschützt
- Serial-Port ist lokal (nicht über Netzwerk erreichbar)

## Erweiterungen

Mögliche zukünftige Features:
- QR-Code für schnelle Registration
- Multi-Card pro User
- Karten-Deaktivierung statt Löschen
- Zugriffslogs
- Webhook-Integrationen
