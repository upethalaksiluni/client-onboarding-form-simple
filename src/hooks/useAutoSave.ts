import { useEffect, useRef } from 'react'
import { UseFormWatch } from 'react-hook-form'

import { OnboardingFormData } from '@/types'

export const useAutoSave = (
  watch: UseFormWatch<OnboardingFormData>,
  setValue: any,
  interval = 2000
) => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  useEffect(() => {
    // Load saved data on mount
    const saved = localStorage.getItem('onboarding-draft')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        Object.keys(data).forEach(key => {
          setValue(key, data[key])
        })
      } catch (error) {
        console.warn('Failed to load saved form data')
      }
    }
  }, [setValue])
  
  useEffect(() => {
    const subscription = watch((data) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        localStorage.setItem('onboarding-draft', JSON.stringify(data))
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
  }
  
  return { clearDraft }
}