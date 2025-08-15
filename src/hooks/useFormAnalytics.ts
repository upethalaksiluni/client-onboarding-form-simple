import { useEffect, useRef } from 'react'
import { UseFormWatch } from 'react-hook-form'
import { OnboardingFormData } from '@/lib/validations'
import { FormAnalytics } from '@/lib/analytics'

export const useFormAnalytics = (
  watch: UseFormWatch<OnboardingFormData>,
  errors: any
) => {
  const analytics = useRef<FormAnalytics>()
  const fieldFocusTimes = useRef<Record<string, number>>({})

  useEffect(() => {
    analytics.current = new FormAnalytics()
    
    // Track form start
    analytics.current.track({ type: 'field_focus', fieldName: 'form_start' })

    // Track page unload (form abandon)
    const handleBeforeUnload = () => {
      analytics.current?.track({ type: 'form_abandon' })
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // Track field changes
  useEffect(() => {
    const subscription = watch((data, { name, type }) => {
      if (!analytics.current || !name) return

      if (type === 'change') {
        analytics.current.track({
          type: 'field_blur',
          fieldName: name,
          value: data[name as keyof OnboardingFormData]
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [watch])

  // Track errors
  useEffect(() => {
    if (!analytics.current) return

    Object.keys(errors).forEach(fieldName => {
      if (errors[fieldName]) {
        analytics.current!.track({
          type: 'field_error',
          fieldName,
          errorMessage: errors[fieldName].message
        })
      }
    })
  }, [errors])

  const trackFieldFocus = (fieldName: string) => {
    if (analytics.current) {
      fieldFocusTimes.current[fieldName] = Date.now()
      analytics.current.track({ type: 'field_focus', fieldName })
    }
  }

  const trackFormSubmit = () => {
    if (analytics.current) {
      analytics.current.track({ type: 'form_submit' })
    }
  }

  const getAnalyticsData = () => {
    return analytics.current?.exportData()
  }

  return {
    trackFieldFocus,
    trackFormSubmit,
    getAnalyticsData
  }
}