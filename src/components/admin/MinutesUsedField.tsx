'use client'

import { useState, useEffect } from 'react'
import { useField, useAuth } from '@payloadcms/ui'
import { RefreshCw, Loader2, Check, AlertCircle } from 'lucide-react'

type Props = {
  path: string
  required: boolean
  label: string
  value?: number
}

export const MinutesUsedField: React.FC<Props> = ({ path, label }) => {
  const { value, setValue } = useField<number>({ path })
  const { user: adminUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const pathParts = window.location.pathname.split('/')
    const usersIndex = pathParts.indexOf('users')
    if (usersIndex !== -1 && pathParts[usersIndex + 1]) {
      const id = pathParts[usersIndex + 1]
      if (id && !id.includes('collections')) {
        setCurrentUserId(id)
      }
    }
  }, [])

  const fetchFreshMinutes = async () => {
    if (!currentUserId) {
      setStatus('error')
      setErrorMessage('User ID not available')
      return
    }

    if (!adminUser) {
      setStatus('error')
      setErrorMessage('Not authenticated as admin')
      return
    }

    setLoading(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      // Call admin API that fetches user and their call history from VAPI
      const response = await fetch(`/api/admin-call-history?userId=${currentUserId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch call history')
      }

      const data = await response.json()
      const freshMinutes = data.totalMinutes || 0

      // Update the value in the form
      setValue(freshMinutes)
      setStatus('success')

      // Show success message briefly
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      console.error('Error fetching minutes:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="minutes-used-field">
      <div className="field-type">
        <div className="label-wrapper">
          <label className="field-label">
            Minutes Used
            <span className="required-indicator">*</span>
          </label>
        </div>

        <div className="field-value-wrapper">
          <div className="flex items-center gap-2">
            <div className="current-value">
              <span className="value-display">{value ?? 0}</span>
              <span className="unit">minutes used</span>
            </div>

            <button
              type="button"
              className={`refresh-button ${loading ? 'loading' : ''}`}
              onClick={fetchFreshMinutes}
              disabled={loading || !currentUserId || !adminUser}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{loading ? 'Fetching...' : 'Refresh'}</span>
            </button>
          </div>

          {status === 'success' && (
            <div className="status-message success">
              <Check className="w-4 h-4" />
              <span>Minutes refreshed! Click Save to persist changes.</span>
            </div>
          )}

          {status === 'error' && (
            <div className="status-message error">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage || 'Failed to fetch minutes'}</span>
            </div>
          )}

          {/* {currentUserId ? (
            <div className="user-info">
              <span className="label">User ID:</span>
              <code className="user-id">{currentUserId}</code>
            </div>
          ) : (
            <div className="status-message error">
              <AlertCircle className="w-4 h-4" />
              <span>User ID not detected. Navigate to a user edit page.</span>
            </div>
          )} */}
        </div>

        <style>{`
          .minutes-used-field {
            margin-bottom: 20px;
          }
          
          .field-label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .required-indicator {
            color: #ef4444;
            margin-left: 2px;
          }
          
          .field-value-wrapper {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .flex {
            display: flex;
          }
          
          .items-center {
            align-items: center;
          }
          
          .gap-2 {
            gap: 8px;
          }
          
          .current-value {
            display: flex;
            align-items: baseline;
            gap: 6px;
            padding: 8px 16px;
            background: #f3f4f6;
            border-radius: 6px;
          }
          
          .value-display {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
          }
          
          .unit {
            font-size: 14px;
            color: #6b7280;
          }
          
          .refresh-button {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .refresh-button:hover:not(:disabled) {
            background: #059669;
          }
          
          .refresh-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .refresh-button.loading {
            background: #6b7280;
          }
          
          .status-message {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
          }
          
          .status-message.success {
            background: #d1fae5;
            color: #065f46;
          }
          
          .status-message.error {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #6b7280;
          }
          
          .user-info .label {
            font-weight: 500;
          }
          
          .user-id {
            padding: 2px 6px;
            background: #e5e7eb;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
          }
          
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default MinutesUsedField
