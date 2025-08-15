import { UseFormReturn } from 'react-hook-form'
import { OnboardingFormData } from '@/lib/validations'

interface ReviewStepProps {
	form: UseFormReturn<OnboardingFormData>
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ form }) => {
	return <div>Review Step</div>
}
