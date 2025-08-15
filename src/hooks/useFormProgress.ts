import { useEffect, useState } from 'react'
import { UseFormWatch } from 'react-hook-form'

import { OnboardingFormData } from '@/types'

export const useFormProgress = (watch: UseFormWatch<OnboardingFormData>) => {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const subscription = watch((data) => {
      const fields = [
        'fullName',
        'email', 
        'companyName',
        'services',
        'projectStartDate',
        'acceptTerms'
      ]
      
      let filledFields = 0
      
      if (data.fullName?.trim()) filledFields++
      if (data.email?.trim()) filledFields++
      if (data.companyName?.trim()) filledFields++
      if (data.services?.length) filledFields++
      if (data.projectStartDate) filledFields++
      if (data.acceptTerms) filledFields++
      
      const percentage = Math.round((filledFields / fields.length) * 100)
      setProgress(percentage)
    })
    
    return () => subscription.unsubscribe()
  }, [watch])
  
  return progress
}