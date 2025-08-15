export interface FormAnalyticsEvent {
  type: 'field_focus' | 'field_blur' | 'field_error' | 'step_change' | 'form_submit' | 'form_abandon' | 'validation_error'
  fieldName?: string
  stepNumber?: number
  timestamp: number
  value?: any
  errorMessage?: string
  duration?: number
}

export interface AnalyticsSummary {
  sessionId: string
  totalTime: number
  fieldCompletionTimes: Record<string, number>
  errorCount: number
  mostProblematicField: string | null
  completionRate: number
  abandonment: boolean
}

export class FormAnalytics {
  private events: FormAnalyticsEvent[] = []
  private sessionId: string
  private startTime: number
  private fieldFocusTimes: Record<string, number> = {}

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    
    // Track page unload for abandonment
    window.addEventListener('beforeunload', () => {
      this.track({ type: 'form_abandon' })
    })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  track(event: Omit<FormAnalyticsEvent, 'timestamp'>) {
    const analyticsEvent: FormAnalyticsEvent = {
      ...event,
      timestamp: Date.now()
    }
    
    // Handle field focus timing
    if (event.type === 'field_focus' && event.fieldName) {
      this.fieldFocusTimes[event.fieldName] = Date.now()
    }
    
    // Calculate field completion time
    if (event.type === 'field_blur' && event.fieldName) {
      const focusTime = this.fieldFocusTimes[event.fieldName]
      if (focusTime) {
        analyticsEvent.duration = Date.now() - focusTime
      }
    }
    
    this.events.push(analyticsEvent)
    
    // Store in localStorage for persistence
    this.persistEvents()
    
    // In production, send to analytics service
    this.sendToAnalytics(analyticsEvent)
  }

  private persistEvents() {
    try {
      localStorage.setItem('form-analytics', JSON.stringify({
        sessionId: this.sessionId,
        events: this.events,
        startTime: this.startTime
      }))
    } catch (error) {
      console.warn('Failed to persist analytics events:', error)
    }
  }

  private sendToAnalytics(event: FormAnalyticsEvent) {
    // In production, replace with actual analytics service
    console.log('📊 Analytics Event:', {
      sessionId: this.sessionId,
      ...event
    })
  }

  getFieldCompletionTime(fieldName: string): number | null {
    const blurEvent = this.events.find(e => 
      e.type === 'field_blur' && e.fieldName === fieldName && e.duration
    )
    return blurEvent?.duration || null
  }

  getFormCompletionRate(): number {
    const totalFields = ['fullName', 'email', 'companyName', 'services', 'projectStartDate', 'acceptTerms']
    const completedFields = new Set()
    
    this.events.forEach(event => {
      if (event.type === 'field_blur' && event.fieldName && event.value) {
        completedFields.add(event.fieldName)
      }
    })
    
    return (completedFields.size / totalFields.length) * 100
  }

  getErrorFields(): string[] {
    const errorFields = new Set<string>()
    
    this.events.forEach(event => {
      if (event.type === 'field_error' && event.fieldName) {
        errorFields.add(event.fieldName)
      }
    })
    
    return Array.from(errorFields)
  }

  getSessionDuration(): number {
    return Date.now() - this.startTime
  }

  getMostProblematicField(): string | null {
    const fieldErrors: Record<string, number> = {}
    
    this.events.forEach(event => {
      if (event.type === 'field_error' && event.fieldName) {
        fieldErrors[event.fieldName] = (fieldErrors[event.fieldName] || 0) + 1
      }
    })
    
    let maxErrors = 0
    let problematicField = null
    
    for (const [field, errorCount] of Object.entries(fieldErrors)) {
      if (errorCount > maxErrors) {
        maxErrors = errorCount
        problematicField = field
      }
    }
    
    return problematicField
  }

  exportData(): AnalyticsSummary {
    const fieldCompletionTimes: Record<string, number> = {}
    
    this.events.forEach(event => {
      if (event.type === 'field_blur' && event.fieldName && event.duration) {
        fieldCompletionTimes[event.fieldName] = event.duration
      }
    })
    
    return {
      sessionId: this.sessionId,
      totalTime: this.getSessionDuration(),
      fieldCompletionTimes,
      errorCount: this.events.filter(e => e.type === 'field_error').length,
      mostProblematicField: this.getMostProblematicField(),
      completionRate: this.getFormCompletionRate(),
      abandonment: this.events.some(e => e.type === 'form_abandon')
    }
  }

  getFormInsights(): {
    quickestField: string | null
    slowestField: string | null
    averageFieldTime: number
    totalErrors: number
    successfulSubmission: boolean
  } {
    const completionTimes = Object.entries(this.exportData().fieldCompletionTimes)
    
    let quickestField = null
    let slowestField = null
    let minTime = Infinity
    let maxTime = 0
    
    completionTimes.forEach(([field, time]) => {
      if (time < minTime) {
        minTime = time
        quickestField = field
      }
      if (time > maxTime) {
        maxTime = time
        slowestField = field
      }
    })
    
    const averageFieldTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, [, time]) => sum + time, 0) / completionTimes.length
      : 0
    
    return {
      quickestField,
      slowestField,
      averageFieldTime,
      totalErrors: this.events.filter(e => e.type === 'field_error').length,
      successfulSubmission: this.events.some(e => e.type === 'form_submit')
    }
  }

  // Static method to load previous session data
  static loadPreviousSession(): FormAnalytics | null {
    try {
      const saved = localStorage.getItem('form-analytics')
      if (saved) {
        const data = JSON.parse(saved)
        const analytics = new FormAnalytics()
        analytics.sessionId = data.sessionId
        analytics.events = data.events || []
        analytics.startTime = data.startTime
        return analytics
      }
    } catch (error) {
      console.warn('Failed to load previous analytics session:', error)
    }
    return null
  }
}

// Hook for using analytics in React components
export const useFormAnalytics = () => {
  const analytics = new FormAnalytics()
  
  const trackFieldFocus = (fieldName: string) => {
    analytics.track({ type: 'field_focus', fieldName })
  }
  
  const trackFieldBlur = (fieldName: string, value: any) => {
    analytics.track({ type: 'field_blur', fieldName, value })
  }
  
  const trackFieldError = (fieldName: string, errorMessage: string) => {
    analytics.track({ type: 'field_error', fieldName, errorMessage })
  }
  
  const trackStepChange = (stepNumber: number) => {
    analytics.track({ type: 'step_change', stepNumber })
  }
  
  const trackFormSubmit = () => {
    analytics.track({ type: 'form_submit' })
  }
  
  return {
    trackFieldFocus,
    trackFieldBlur,
    trackFieldError,
    trackStepChange,
    trackFormSubmit,
    getInsights: () => analytics.getFormInsights(),
    exportData: () => analytics.exportData()
  }
}