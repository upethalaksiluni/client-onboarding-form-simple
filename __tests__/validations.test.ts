import { onboardingSchema } from '../src/lib/validations'

describe('Onboarding Schema Validation', () => {
  const validData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    companyName: 'Test Corp',
    services: ['UI/UX'],
    budgetUsd: 50000,
    projectStartDate: '2025-12-01',
    acceptTerms: true
  }

  test('should validate correct data', () => {
    const result = onboardingSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  test('should reject invalid full name', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      fullName: 'J@hn D0e!' // Invalid characters
    })
    expect(result.success).toBe(false)
  })

  test('should reject invalid email', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      email: 'invalid-email'
    })
    expect(result.success).toBe(false)
  })

  test('should reject empty services array', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      services: []
    })
    expect(result.success).toBe(false)
  })

  test('should reject past date', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      projectStartDate: '2020-01-01'
    })
    expect(result.success).toBe(false)
  })

  test('should reject unchecked terms', () => {
    const result = onboardingSchema.safeParse({
      ...validData,
      acceptTerms: false
    })
    expect(result.success).toBe(false)
  })

  test('should allow optional budget', () => {
    const { budgetUsd, ...dataWithoutBudget } = validData
    const result = onboardingSchema.safeParse(dataWithoutBudget)
    expect(result.success).toBe(true)
  })
})