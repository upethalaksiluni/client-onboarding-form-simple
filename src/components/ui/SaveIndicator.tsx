import React from 'react'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveIndicatorProps {
  status: SaveStatus
  lastSaved?: Date
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status, lastSaved }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Clock,
          text: 'Saving...',
          className: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        }
      case 'saved':
        return {
          icon: CheckCircle,
          text: 'Saved',
          className: 'text-green-600 bg-green-50 border-green-200'
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          className: 'text-red-600 bg-red-50 border-red-200'
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${config.className} transition-all duration-200`}>
      <Icon size={14} />
      <span>{config.text}</span>
      {lastSaved && status === 'saved' && (
        <span className="text-xs opacity-75">
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}