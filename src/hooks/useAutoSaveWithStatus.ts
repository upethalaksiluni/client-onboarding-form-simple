import { useEffect, useRef, useState } from 'react'
import { UseFormWatch, UseFormSetValue } from 'react-hook-form'

import { OnboardingFormData } from '@/types'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export const useAutoSaveWithStatus = (
  watch: UseFormWatch<OnboardingFormData>,
  setValue: UseFormSetValue<OnboardingFormData>,
  interval = 3000
) => {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date>()
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isInitialLoad = useRef(true)

  useEffect(() => {
    // Load saved data on mount
    const saved = localStorage.getItem('onboarding-draft')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            setValue(key as keyof OnboardingFormData, data[key])
          }
        })
        setLastSaved(new Date(data._lastSaved || Date.now()))
      } catch (error) {
        setStatus('error')
        console.warn('Failed to load saved form data')
      }
    }
    isInitialLoad.current = false
  }, [setValue])

  useEffect(() => {
    const subscription = watch((data) => {
      if (isInitialLoad.current) return
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setStatus('saving')
      
      timeoutRef.current = setTimeout(async () => {
        try {
          const dataWithTimestamp = {
            ...data,
            _lastSaved: new Date().toISOString()
          }
          
          localStorage.setItem('onboarding-draft', JSON.stringify(dataWithTimestamp))
          setStatus('saved')
          setLastSaved(new Date())
          
          // Reset to idle after 2 seconds
          setTimeout(() => setStatus('idle'), 2000)
        } catch (error) {
          setStatus('error')
          console.error('Failed to save form data:', error)
        }
      }, interval)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [watch, interval])

  const clearDraft = () => {
    localStorage.removeItem('onboarding-draft')
    setStatus('idle')
    setLastSaved(undefined)
  }

  const hasDraft = () => {
    return localStorage.getItem('onboarding-draft') !== null
  }

  return {
    status,
    lastSaved,
    clearDraft,
    hasDraft: hasDraft()
  }
}