import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormWizard from '../src/components/FormWizard'

// Mock Next.js environment variables
process.env.NEXT_PUBLIC_ONBOARD_URL = 'https://example.com/api/onboard'

describe('FormWizard', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  test('renders first step by default', () => {
    render(<FormWizard />)
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  test('validates step 1 fields before proceeding', async () => {
    const user = userEvent.setup()
    render(<FormWizard />)
    
    const nextButton = screen.getByText('Next Step')
    await user.click(nextButton)
    
    // This test ensures that validation errors are shown and the step does not advance if required fields are missing.
    expect(screen.getByText('Full name is required')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  test('progresses through steps when valid data is entered', async () => {
    const user = userEvent.setup()
    render(<FormWizard />)
    
    // Fill step 1
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/company name/i), 'Test Corp')
    
    await user.click(screen.getByText('Next Step'))
    
    await waitFor(() => {
      expect(screen.getByText('Project Details')).toBeInTheDocument()
      expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    })
  })

  test('updates progress bar correctly', async () => {
    const user = userEvent.setup()
    render(<FormWizard />)
    
    // Should start at ~33% (step 1 of 3)
    expect(screen.getByText('33% Complete')).toBeInTheDocument()
    
    // Fill step 1 and proceed
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/company name/i), 'Test Corp')
    await user.click(screen.getByText('Next Step'))
    
    await waitFor(() => {
      expect(screen.getByText('67% Complete')).toBeInTheDocument()
    })
  })

  test('handles form submission on final step', async () => {
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock

    const user = userEvent.setup()
    render(<FormWizard />)
    
    // Navigate through all steps with valid data
    // Step 1
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/company name/i), 'Test Corp')
    await user.click(screen.getByText('Next Step'))
    
    // Step 2
    await waitFor(() => screen.getByText('Project Details'))
    await user.click(screen.getByLabelText('UI/UX'))
    await user.type(screen.getByLabelText(/project start date/i), '2025-12-01')
    await user.click(screen.getByText('Next Step'))
    
    // Step 3
    await waitFor(() => screen.getByText('Review & Submit'))
    await user.click(screen.getByLabelText(/accept terms/i))
    
    const submitButton = screen.getByText('Submit Application')
    await user.click(submitButton)
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/api/onboard',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('John Doe')
      })
    )
  })
})