import { OnboardingFormData } from '@/lib/validations'

const FORM_STORAGE_KEY = 'onboarding-form-draft'
const FORM_METADATA_KEY = 'onboarding-form-metadata'

export interface FormMetadata {
  lastSaved: string
  version: string
  sessionId: string
  fieldCompletionTimes: Record<string, number>
}

export const saveFormData = (data: Partial<OnboardingFormData>): boolean => {
  try {
    const metadata: FormMetadata = {
      lastSaved: new Date().toISOString(),
      version: '1.0',
      sessionId: getSessionId(),
      fieldCompletionTimes: getFieldCompletionTimes()
    }

    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
    localStorage.setItem(FORM_METADATA_KEY, JSON.stringify(metadata))
    return true
  } catch (error) {
    console.error('Failed to save form data:', error)
    return false
  }
}

export const loadFormData = (): { data: Partial<OnboardingFormData> | null, metadata: FormMetadata | null } => {
  try {
    const dataStr = localStorage.getItem(FORM_STORAGE_KEY)
    const metadataStr = localStorage.getItem(FORM_METADATA_KEY)
    
    const data = dataStr ? JSON.parse(dataStr) : null
    const metadata = metadataStr ? JSON.parse(metadataStr) : null
    
    return { data, metadata }
  } catch (error) {
    console.error('Failed to load form data:', error)
    return { data: null, metadata: null }
  }
}

export const clearFormData = (): boolean => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY)
    localStorage.removeItem(FORM_METADATA_KEY)
    localStorage.removeItem('form-session-id')
    return true
  } catch (error) {
    console.error('Failed to clear form data:', error)
    return false
  }
}

export const hasStoredData = (): boolean => {
  return localStorage.getItem(FORM_STORAGE_KEY) !== null
}

export const getStorageSize = (): number => {
  const data = localStorage.getItem(FORM_STORAGE_KEY)
  return data ? new Blob([data]).size : 0
}

export const exportFormData = (): string => {
  const { data, metadata } = loadFormData()
  return JSON.stringify({ data, metadata }, null, 2)
}

// Helper functions
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('form-session-id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('form-session-id', sessionId)
  }
  return sessionId
}

const getFieldCompletionTimes = (): Record<string, number> => {
  const timesStr = localStorage.getItem('field-completion-times')
  return timesStr ? JSON.parse(timesStr) : {}
}