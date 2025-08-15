import { UseFormReturn } from 'react-hook-form'
import { OnboardingFormData } from '@/lib/validations'

interface ProjectDetailsStepProps {
	form: UseFormReturn<OnboardingFormData>
}

export const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ form }) => {
	return <div>Project Details Step</div>
}
