interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({
  totalSteps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <button
            key={step}
            className={`dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => onStepClick(step)}
            title={`Go to step ${step}`}
            aria-label={`Step ${step}${isActive ? ' (current)' : ''}`}
          />
        );
      })}
    </div>
  );
}
