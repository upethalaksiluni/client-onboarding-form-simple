import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import type { OnboardingFormData } from '../src/types'
import { useAutoSaveWithStatus } from '../src/hooks/useAutoSaveWithStatus'

describe('useAutoSaveWithStatus', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('loads saved data from localStorage on mount', () => {
    const savedData = { fullName: 'John Doe', email: 'john@example.com' }
    localStorage.setItem('onboarding-draft', JSON.stringify(savedData))

    const { result } = renderHook(() => {
  const form = useForm<OnboardingFormData>()
      return {
  autoSave: useAutoSaveWithStatus(form.watch, form.setValue),
        form
      }
    })

    expect(result.current.autoSave.hasDraft).toBe(true)
  })

  test('saves data to localStorage after interval', () => {
    const { result } = renderHook(() => {
    const form = useForm<OnboardingFormData>()
      return {
  autoSave: useAutoSaveWithStatus(form.watch, form.setValue, 1000),
        form
      }
    })

    // Simulate form data change
    act(() => {
      result.current.form.setValue('fullName', 'John Doe')
    })

    expect(result.current.autoSave.status).toBe('saving')

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(localStorage.getItem('onboarding-draft')).toContain('John Doe')
    expect(result.current.autoSave.status).toBe('saved')
  })

  test('clears draft from localStorage', () => {
    localStorage.setItem('onboarding-draft', JSON.stringify({ test: 'data' }))

    const { result } = renderHook(() => {
      const form = useForm()
  const typedForm = useForm<OnboardingFormData>()
  return useAutoSaveWithStatus(typedForm.watch, typedForm.setValue)
    })

    act(() => {
      result.current.clearDraft()
    })

    expect(localStorage.getItem('onboarding-draft')).toBeNull()
    expect(result.current.hasDraft).toBe(false)
  })
})
