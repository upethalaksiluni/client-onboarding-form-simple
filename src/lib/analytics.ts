export interface FormAnalyticsEvent {
  type: 'field_focus' | 'field_blur' | 'field_error' | 'step_change' | 'form_submit' | 'form_abandon'
  fieldName?: string
  stepNumber?: number
  timestamp: number
  value?: any
  errorMessage?: string
}

export class FormAnalytics {
  private events: FormAnalyticsEvent[] = []
  private sessionId: string
  private startTime: number

  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  track(event: Omit<FormAnalyticsEvent, 'timestamp'>) {
    const analyticsEvent: FormAnalyticsEvent = {
      ...event,
      timestamp: Date.now()
    }
    
    this.events.push(analyticsEvent)
    
    // In a real app, you'd send this to your analytics service
    console.log('Analytics Event:', analyticsEvent)
  }

  getFieldCompletionTime(fieldName: string): number | null {
    const focusEvent = this.events.find(e => 
      e.type === 'field_focus' && e.fieldName === fieldName
    )
    const blurEvent = this.events.find(e => 
      e.type === 'field_blur' && e.fieldName === fieldName
    )
    
    if (focusEvent && blurEvent) {
      return blurEvent.timestamp - focusEvent.timestamp
    }
    return null
  }

  getFormCompletionRate(): number {
    const totalFields = ['fullName', 'email', 'companyName', 'services', 'projectStartDate', 'acceptTerms']
    const completedFields = new Set(
      this.events
        .filter(e => e.type === 'field_blur' && e.value)
        .map(e => e.fieldName)
    )
    
    return (completedFields.size / totalFields.length) * 100
  }

  getErrorFields(): string[] {
    return Array.from(new Set(
      this.events
        .filter(e => e.type === 'field_error')
        .map(e => e.fieldName!)
    ))
  }

  getSessionDuration(): number {
    return Date.now() - this.startTime
  }

  exportData() {
    return {
      sessionId: this.sessionId,
      events: this.events,
      duration: this.getSessionDuration(),
      completionRate: this.getFormCompletionRate(),
      errorFields: this.getErrorFields()
    }
  }
}