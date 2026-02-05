'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RfidLoginButtonProps {
  className?: string
  onSuccess?: (user: any) => void
}

export default function RfidLoginButton({ className = '', onSuccess }: RfidLoginButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [polling, setPolling] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleStartScanning = async () => {
    setLoading(true)
    setMessage('Scanning... Bitte Karte scannen...')
    setError('')

    try {
      // Starte Auto-Polling für 30 Sekunden
      let attempts = 0
      const maxAttempts = 30 // 30 Sekunden (1 Sekunde * 30)

      const pollForLogin = async () => {
        attempts++
        if (attempts > maxAttempts) {
          setPolling(false)
          setLoading(false)
          setMessage('')
          setError('Timeout: Keine Karte gescannt. Bitte erneut versuchen.')
          return
        }

        try {
          const response = await fetch('/api/rfid/login', {
            method: 'POST'
          })

          const data = await response.json()

          if (data.ok && data.user) {
            setPolling(false)
            setLoading(false)
            setMessage(`✓ Login erfolgreich: ${data.user.name || `User ${data.user.id}`}`)
            if (onSuccess) onSuccess(data.user)
            // Redirect nach 1 Sekunde
            setTimeout(() => {
              const dest = data.user.role === 'admin' ? '/admin' : '/dashboard'
              router.push(dest)
            }, 1000)
          } else if (data.error) {
            setError(data.error)
            // Versuche erneut, falls "keine Karte" Fehler
            if (data.error.includes('gescannt')) {
              setTimeout(pollForLogin, 1000)
            } else {
              setPolling(false)
              setLoading(false)
            }
          }
        } catch (err) {
          console.error('RFID poll error:', err)
          setError('Fehler beim Polling')
          setPolling(false)
          setLoading(false)
        }
      }

      setPolling(true)
      await pollForLogin()
    } catch (err) {
      setLoading(false)
      console.error('RFID error:', err)
      setError('Fehler beim Starten des Scan-Vorgangs')
    }
  }

  const handleCancel = () => {
    setPolling(false)
    setLoading(false)
    setMessage('')
    setError('')
  }

  if (polling) {
    return (
      <div className={`rfid-scanning ${className}`}>
        <div className="rfid-status">
          <div className="spinner"></div>
          <p>{message}</p>
          {error && <p className="error">{error}</p>}
          <button onClick={handleCancel} className="cancel-btn">
            Abbrechen
          </button>
        </div>
        <style>{`
          .rfid-scanning {
            text-align: center;
            padding: 20px;
          }
          .rfid-status {
            display: flex;
            flex-direction: column;
            gap: 15px;
            align-items: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .error {
            color: #e74c3c;
            font-weight: bold;
          }
          .cancel-btn {
            padding: 8px 16px;
            background-color: #95a5a6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }
          .cancel-btn:hover {
            background-color: #7f8c8d;
          }
        `}</style>
      </div>
    )
  }

  return (
    <button
      onClick={handleStartScanning}
      disabled={loading}
      className={`rfid-login-btn ${className}`}
    >
      {loading ? 'Vorbereitung...' : '📱 Mit RFID einloggen'}
      <style>{`
        .rfid-login-btn {
          padding: 12px 24px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .rfid-login-btn:hover:not(:disabled) {
          background-color: #2980b9;
        }
        .rfid-login-btn:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  )
}
