import { useState } from 'react'

export const useFormWizard = (totalSteps: number) => {
  const [currentStep, setCurrentStep] = useState(1)
  
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))
  const goToStep = (step: number) => setCurrentStep(Math.max(1, Math.min(step, totalSteps)))
  
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps
  const progress = (currentStep / totalSteps) * 100
  
  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    progress
  }
}