import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  sessionId: string
  duration: number
  completionRate: number
  errorFields: string[]
  events: any[]
}

interface AnalyticsDashboardProps {
  data: AnalyticsData
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data }) => {
  const [isVisible, setIsVisible] = useState(false)

  if (!data) return null

  const fieldErrorData = data.errorFields.map(field => ({
    field,
    errors: data.events.filter(e => e.type === 'field_error' && e.fieldName === field).length
  }))

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="View Analytics"
      >
        📊
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 w-96 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Form Analytics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-blue-600">Completion Rate</div>
                <div className="text-xl font-semibold text-blue-900">
                  {data.completionRate.toFixed(1)}%
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm text-green-600">Session Time</div>
                <div className="text-xl font-semibold text-green-900">
                  {formatDuration(data.duration)}
                </div>
              </div>
            </div>

            {fieldErrorData.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Field Errors</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={fieldErrorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="field" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="errors" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recent Events</h4>
              <div className="max-h-32 overflow-y-auto text-xs">
                {data.events.slice(-5).map((event, index) => (
                  <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-600">{event.type}</span>
                    <span className="text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}