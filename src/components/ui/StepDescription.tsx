import type { TutorialStep } from '@/types/tutorial';

interface StepDescriptionProps {
  step: TutorialStep | null;
  totalSteps: number;
  currentStep: number;
}

export function StepDescription({ step, totalSteps, currentStep }: StepDescriptionProps) {
  if (!step) {
    return (
      <div className="step-panel">
        <p>No step data available</p>
      </div>
    );
  }

  return (
    <div className="step-panel">
      <h3>Step {currentStep} of {totalSteps}</h3>
      <div className="step-title">{step.title}</div>
      <p className="step-description">{step.description}</p>

      {step.tips && step.tips.length > 0 && (
        <div className="tips">
          <h4>Tips</h4>
          <ul>
            {step.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
