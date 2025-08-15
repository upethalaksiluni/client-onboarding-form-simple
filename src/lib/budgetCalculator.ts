export interface ServiceBudgetRange {
  service: string
  minBudget: number
  maxBudget: number
  averageBudget: number
  complexity: 'low' | 'medium' | 'high'
}

export interface BudgetSuggestion {
  label: string
  amount: number
  description: string
  services: string[]
  reasoning: string[]
}

const SERVICE_BUDGET_DATA: Record<string, ServiceBudgetRange> = {
  'UI/UX': {
    service: 'UI/UX',
    minBudget: 5000,
    maxBudget: 50000,
    averageBudget: 15000,
    complexity: 'medium'
  },
  'Branding': {
    service: 'Branding',
    minBudget: 3000,
    maxBudget: 25000,
    averageBudget: 8000,
    complexity: 'low'
  },
  'Web Dev': {
    service: 'Web Dev',
    minBudget: 10000,
    maxBudget: 200000,
    averageBudget: 35000,
    complexity: 'high'
  },
  'Mobile App': {
    service: 'Mobile App',
    minBudget: 25000,
    maxBudget: 500000,
    averageBudget: 75000,
    complexity: 'high'
  }
}

export const calculateBudgetRange = (selectedServices: string[]): {
  minimum: number
  maximum: number
  recommended: number
  breakdown: ServiceBudgetRange[]
} => {
  const breakdown = selectedServices
    .map(service => SERVICE_BUDGET_DATA[service])
    .filter(Boolean)

  const minimum = breakdown.reduce((sum, item) => sum + item.minBudget, 0)
  const maximum = breakdown.reduce((sum, item) => sum + item.maxBudget, 0)
  const recommended = breakdown.reduce((sum, item) => sum + item.averageBudget, 0)

  return { minimum, maximum, recommended, breakdown }
}

export const suggestBudgets = (selectedServices: string[]): BudgetSuggestion[] => {
  if (!selectedServices.length) return []

  const { minimum, maximum, recommended } = calculateBudgetRange(selectedServices)
  
  const suggestions: BudgetSuggestion[] = [
    {
      label: 'Essential',
      amount: minimum,
      description: 'Basic implementation with core features',
      services: selectedServices,
      reasoning: [
        'Minimum viable product approach',
        'Core functionality only',
        'Standard design patterns'
      ]
    },
    {
      label: 'Professional',
      amount: recommended,
      description: 'Balanced approach with quality and features',
      services: selectedServices,
      reasoning: [
        'Industry standard quality',
        'Enhanced user experience',
        'Custom design elements',
        'Performance optimization'
      ]
    },
    {
      label: 'Premium',
      amount: Math.round(recommended * 1.5),
      description: 'High-end solution with advanced features',
      services: selectedServices,
      reasoning: [
        'Cutting-edge technology',
        'Advanced animations and interactions',
        'Comprehensive testing',
        'Future-proof architecture'
      ]
    }
  ]

  // Add enterprise tier for complex projects
  if (selectedServices.includes('Web Dev') && selectedServices.includes('Mobile App')) {
    suggestions.push({
      label: 'Enterprise',
      amount: Math.round(maximum * 0.8),
      description: 'Full-scale enterprise solution',
      services: selectedServices,
      reasoning: [
        'Scalable architecture',
        'Advanced security features',
        'Integration capabilities',
        'Dedicated support team'
      ]
    })
  }

  return suggestions
}

export const getBudgetInsights = (selectedServices: string[], currentBudget?: number): {
  adequacy: 'insufficient' | 'minimal' | 'adequate' | 'generous'
  suggestions: string[]
  alternatives: string[]
} => {
  if (!currentBudget) {
    return {
      adequacy: 'minimal',
      suggestions: ['Please enter a budget to get personalized insights'],
      alternatives: []
    }
  }

  const { minimum, recommended, maximum } = calculateBudgetRange(selectedServices)
  
  let adequacy: 'insufficient' | 'minimal' | 'adequate' | 'generous'
  let suggestions: string[] = []
  let alternatives: string[] = []

  if (currentBudget < minimum) {
    adequacy = 'insufficient'
    suggestions = [
      'Consider reducing project scope',
      'Phase the project into multiple releases',
      'Focus on MVP (Minimum Viable Product) first'
    ]
    alternatives = [
      'Remove some services to fit budget',
      'Consider template-based solutions',
      'Extend project timeline for better rates'
    ]
  } else if (currentBudget < recommended) {
    adequacy = 'minimal'
    suggestions = [
      'Budget covers basic requirements',
      'Limited customization options',
      'Standard implementation approach'
    ]
    alternatives = [
      `Increase budget to $${recommended.toLocaleString()} for better quality`,
      'Phase premium features into later releases'
    ]
  } else if (currentBudget <= maximum) {
    adequacy = 'adequate'
    suggestions = [
      'Great budget for quality implementation',
      'Room for custom features and optimization',
      'Can include advanced functionality'
    ]
  } else {
    adequacy = 'generous'
    suggestions = [
      'Excellent budget for premium implementation',
      'Can include cutting-edge features',
      'Room for extensive testing and optimization'
    ]
    alternatives = [
      'Consider adding additional services',
      'Invest in premium design and UX',
      'Plan for future enhancements'
    ]
  }

  return { adequacy, suggestions, alternatives }
}

export const formatBudgetRange = (min: number, max: number): string => {
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`
}

export const calculateProjectComplexity = (selectedServices: string[]): {
  score: number
  level: 'simple' | 'moderate' | 'complex' | 'enterprise'
  factors: string[]
} => {
  let score = 0
  const factors: string[] = []

  selectedServices.forEach(service => {
    const serviceData = SERVICE_BUDGET_DATA[service]
    if (serviceData) {
      switch (serviceData.complexity) {
        case 'low': score += 1; break
        case 'medium': score += 2; break
        case 'high': score += 3; break
      }
    }
  })

  // Add complexity for service combinations
  if (selectedServices.includes('Web Dev') && selectedServices.includes('Mobile App')) {
    score += 2
    factors.push('Cross-platform development complexity')
  }

  if (selectedServices.includes('UI/UX') && selectedServices.length > 2) {
    score += 1
    factors.push('Multi-service design coordination')
  }

  let level: 'simple' | 'moderate' | 'complex' | 'enterprise'
  if (score <= 2) level = 'simple'
  else if (score <= 4) level = 'moderate'
  else if (score <= 6) level = 'complex'
  else level = 'enterprise'

  return { score, level, factors }
}