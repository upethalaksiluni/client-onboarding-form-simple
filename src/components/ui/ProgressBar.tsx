import React from 'react'

interface ProgressBarProps {
  progress: number
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className = '' 
}) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="text-xs text-gray-500 mt-1 text-center">
        {progress}% Complete
      </div>
    </div>
  )
}