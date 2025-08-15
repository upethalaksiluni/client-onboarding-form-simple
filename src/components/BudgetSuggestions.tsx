import React, { useMemo } from 'react'
import { OnboardingFormData } from '@/lib/validations'

interface BudgetSuggestionsProps {
  selectedServices: string[]
  onBudgetSelect: (budget: number) => void
}

const serviceBudgets = {
  'UI/UX': { min: 5000, max: 25000 },
  'Branding': { min: 3000, max: 15000 },
  'Web Dev': { min: 10000, max: 100000 },
  'Mobile App': { min: 20000, max: 200000 }
}

export const BudgetSuggestions: React.FC<BudgetSuggestionsProps> = ({
  selectedServices,
  onBudgetSelect
}) => {
  const suggestedBudgets = useMemo(() => {
    if (!selectedServices.length) return []
    
    const totalMin = selectedServices.reduce((sum, service) => 
      sum + (serviceBudgets[service as keyof typeof serviceBudgets]?.min || 0), 0
    )
    const totalMax = selectedServices.reduce((sum, service) => 
      sum + (serviceBudgets[service as keyof typeof serviceBudgets]?.max || 0), 0
    )
    
    return [
      { label: 'Basic', amount: totalMin },
      { label: 'Standard', amount: Math.round((totalMin + totalMax) / 2) },
      { label: 'Premium', amount: totalMax }
    ]
  }, [selectedServices])
  
  if (!suggestedBudgets.length) return null
  
  return (
    <div className="mt-2 p-3 bg-blue-50 rounded-md">
      <p className="text-sm text-blue-700 mb-2">Suggested budgets for selected services:</p>
      <div className="flex gap-2">
        {suggestedBudgets.map(({ label, amount }) => (
          <button
            key={label}
            type="button"
            onClick={() => onBudgetSelect(amount)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {label}: ${amount.toLocaleString()}
          </button>
        ))}
      </div>
    </div>
  )
}