import { PlaybackControls } from './PlaybackControls';
import { StepIndicator } from './StepIndicator';
import { StepDescription } from './StepDescription';
import { WeaveInfo } from './WeaveInfo';
import type { ChainmailTutorial, TutorialStep } from '@/types/tutorial';

interface TutorialPlayerProps {
  tutorial: ChainmailTutorial;
  currentStep: number;
  totalSteps: number;
  currentStepData: TutorialStep | null;
  isPlaying: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onStepClick: (step: number) => void;
}

export function TutorialPlayer({
  tutorial,
  currentStep,
  totalSteps,
  currentStepData,
  isPlaying,
  canGoNext,
  canGoPrev,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onStepClick,
}: TutorialPlayerProps) {
  return (
    <div className="sidebar">
      <WeaveInfo metadata={tutorial.metadata} />

      <StepDescription
        step={currentStepData}
        totalSteps={totalSteps}
        currentStep={currentStep}
      />

      <div className="controls-bar">
        <PlaybackControls
          isPlaying={isPlaying}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          onPlay={onPlay}
          onPause={onPause}
          onNext={onNext}
          onPrev={onPrev}
          onReset={onReset}
        />

        <StepIndicator
          totalSteps={totalSteps}
          currentStep={currentStep}
          onStepClick={onStepClick}
        />
      </div>
    </div>
  );
}
