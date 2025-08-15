'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, SERVICE_OPTIONS } from '@/lib/validations'
import type { OnboardingFormData } from '@/types'
import { getTodayDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { Alert, AlertDescription } from '@/components/ui/Alert'

export default function ClientOnboardingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'destructive' | null
    message: string
    data?: OnboardingFormData
  }>({ type: null, message: '' })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      services: [],
      acceptTerms: true
    }
  })

  // Pre-fill from query parameters (bonus feature)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const serviceParam = urlParams.get('service')
      
      if (serviceParam && SERVICE_OPTIONS.includes(serviceParam as any)) {
        setValue('services', [serviceParam as any])
      }
    }
  }, [setValue])

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_ONBOARD_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your information has been submitted successfully.',
          data
        })
        reset()
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      setSubmitStatus({
        type: 'destructive',
        message: error instanceof Error 
          ? `Submission failed: ${error.message}`
          : 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
      {/* Status Messages */}
      {submitStatus.type && (
        <Alert variant={submitStatus.type === 'success' ? 'success' : 'destructive'}>
          <AlertDescription>
            {submitStatus.message}
            {submitStatus.type === 'success' && submitStatus.data && (
              <div className="mt-3 text-xs">
                <strong>Summary:</strong>
                <ul className="mt-1 list-disc list-inside">
                  <li>Name: {submitStatus.data.fullName}</li>
                  <li>Company: {submitStatus.data.companyName}</li>
                  <li>Services: {submitStatus.data.services.join(', ')}</li>
                  {submitStatus.data.budgetUsd && (
                    <li>Budget: ${submitStatus.data.budgetUsd.toLocaleString()}</li>
                  )}
                  <li>Start Date: {submitStatus.data.projectStartDate}</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

  <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="block mb-2">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="Enter your full name"
            className={errors.fullName ? 'border-red-500' : ''}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="block mb-2">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter your email"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <Label htmlFor="companyName" className="block mb-2">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            {...register('companyName')}
            placeholder="Enter your company name"
            className={errors.companyName ? 'border-red-500' : ''}
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        {/* Services */}
        <div>
          <Label className="block mb-3">
            Services Interested In <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="services"
            control={control}
            render={({ field: { value, onChange } }) => (
              <div className="space-y-2">
                {SERVICE_OPTIONS.map((service) => (
                  <Checkbox
                    key={service}
                    id={`service-${service}`}
                    label={service}
                    checked={value.includes(service)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.checked) {
                        onChange([...value, service])
                      } else {
                        onChange(value.filter(s => s !== service))
                      }
                    }}
                  />
                ))}
              </div>
            )}
          />
          {errors.services && (
            <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>
          )}
        </div>

        {/* Budget */}
        <div>
          <Label htmlFor="budgetUsd" className="block mb-2">
            Budget (USD)
          </Label>
          <Input
            id="budgetUsd"
            type="number"
            {...register('budgetUsd', { 
              valueAsNumber: true,
              setValueAs: (v) => v === '' ? undefined : parseInt(v)
            })}
            placeholder="e.g., 50000"
            min="100"
            max="1000000"
            className={errors.budgetUsd ? 'border-red-500' : ''}
          />
          {errors.budgetUsd && (
            <p className="mt-1 text-sm text-red-600">{errors.budgetUsd.message}</p>
          )}
        </div>

        {/* Project Start Date */}
        <div>
          <Label htmlFor="projectStartDate" className="block mb-2">
            Project Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="projectStartDate"
            type="date"
            {...register('projectStartDate')}
            min={getTodayDate()}
            className={errors.projectStartDate ? 'border-red-500' : ''}
          />
          {errors.projectStartDate && (
            <p className="mt-1 text-sm text-red-600">{errors.projectStartDate.message}</p>
          )}
        </div>

        {/* Accept Terms */}
        <div>
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                id="acceptTerms"
                checked={value}
                onChange={onChange}
                label={"I accept the terms and conditions *"}
              />
            )}
          />
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </div>
  )
}