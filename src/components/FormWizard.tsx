'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, OnboardingFormData } from '@/lib/validations'
import { useFormWizard } from '@/hooks/useFormWizard'
import { PersonalInfoStep } from './steps/PersonalInfoStep'
import { ProjectDetailsStep } from './steps/ProjectDetailsStep'
import { ReviewStep } from './steps/ReviewStep'
import { Button } from '@/components/ui/Button'

export default function FormWizard() {
  const { currentStep, nextStep, prevStep, isFirstStep, isLastStep, progress } = useFormWizard(3)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: {
      services: [],
      acceptTerms: true
    }
  })

  const { handleSubmit, trigger, formState: { isValid } } = form

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid) nextStep()
  }

  const getFieldsForStep = (step: number): (keyof OnboardingFormData)[] => {
    switch (step) {
      case 1: return ['fullName', 'email', 'companyName']
      case 2: return ['services', 'budgetUsd', 'projectStartDate']
      case 3: return ['acceptTerms']
      default: return []
    }
  }

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_ONBOARD_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        alert('Success! Form submitted.')
      }
    } catch (error) {
      alert('Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PersonalInfoStep form={form} />
      case 2: return <ProjectDetailsStep form={form} />
      case 3: return <ReviewStep form={form} />
      default: return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {renderStep()}
        
        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            onClick={prevStep}
            disabled={isFirstStep}
            variant="outline"
          >
            Previous
          </Button>
          
          {isLastStep ? (
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next Step
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}