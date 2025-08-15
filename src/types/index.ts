
export interface OnboardingFormData {
  fullName: string
  email: string
  companyName: string
  services: ServiceOption[]
  budgetUsd?: number
  projectStartDate: string
  acceptTerms: boolean
}

export const SERVICE_OPTIONS = [
  'UI/UX',
  'Branding', 
  'Web Dev',
  'Mobile App'
] as const

export type ServiceOption = typeof SERVICE_OPTIONS[number]