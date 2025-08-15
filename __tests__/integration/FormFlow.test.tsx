import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClientOnboardingForm from '@/components/ClientOnboardingForm'

describe('Form Integration Flow', () => {
  test('complete form submission flow with analytics', async () => {
    // Mock console.log to capture analytics events
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as jest.Mock

    const user = userEvent.setup()
    render(<ClientOnboardingForm />)

    // Fill out form completely
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/company name/i), 'Test Corp')
    await user.click(screen.getByLabelText('UI/UX'))
    await user.type(screen.getByLabelText(/budget/i), '50000')
    await user.type(screen.getByLabelText(/project start date/i), '2025-12-01')
    await user.click(screen.getByLabelText(/accept terms/i))

    // Submit form
    await user.click(screen.getByText('Submit Application'))

    // Verify submission
    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument()
    })

    // Verify analytics events were tracked
    expect(consoleSpy).toHaveBeenCalledWith(
      'Analytics Event:',
      expect.objectContaining({
        type: 'form_submit'
      })
    )

    consoleSpy.mockRestore()
  })
})