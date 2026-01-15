import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ChainmailTutorial, TutorialStep } from '@/types/tutorial';

interface UseTutorialPlayerProps {
  tutorial: ChainmailTutorial | null;
}

interface UseTutorialPlayerReturn {
  currentStep: number;
  isPlaying: boolean;
  playbackSpeed: number;
  visibleRingIds: string[];
  newRingIds: string[];
  highlightedRingIds: string[];
  currentStepData: TutorialStep | null;
  totalSteps: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

export function useTutorialPlayer({ tutorial }: UseTutorialPlayerProps): UseTutorialPlayerReturn {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2000); // ms per step

  const totalSteps = tutorial?.steps.length ?? 0;
  const canGoNext = currentStep < totalSteps;
  const canGoPrev = currentStep > 1;

  const currentStepData = useMemo(() => {
    if (!tutorial) return null;
    return tutorial.steps.find(s => s.stepNumber === currentStep) ?? null;
  }, [tutorial, currentStep]);

  // Calculate visible rings (all rings from step 1 to current step)
  const visibleRingIds = useMemo(() => {
    if (!tutorial) return [];
    const ids: string[] = [];
    for (const step of tutorial.steps) {
      if (step.stepNumber <= currentStep) {
        ids.push(...step.ringsToAdd);
      }
    }
    return ids;
  }, [tutorial, currentStep]);

  // Rings added in the current step (for animation)
  const newRingIds = useMemo(() => {
    return currentStepData?.ringsToAdd ?? [];
  }, [currentStepData]);

  // Highlighted rings from current step
  const highlightedRingIds = useMemo(() => {
    return currentStepData?.ringsToHighlight ?? [];
  }, [currentStepData]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const nextStep = useCallback(() => {
    if (canGoNext) {
      setCurrentStep(s => s + 1);
    } else {
      setIsPlaying(false);
    }
  }, [canGoNext]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      setCurrentStep(s => s - 1);
    }
  }, [canGoPrev]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const reset = useCallback(() => {
    setCurrentStep(1);
    setIsPlaying(false);
  }, []);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (canGoNext) {
        nextStep();
      } else {
        setIsPlaying(false);
      }
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, playbackSpeed, canGoNext, nextStep]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'Home':
          e.preventDefault();
          reset();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextStep, prevStep, reset]);

  // Reset when tutorial changes
  useEffect(() => {
    setCurrentStep(1);
    setIsPlaying(false);
  }, [tutorial?.metadata.id]);

  return {
    currentStep,
    isPlaying,
    playbackSpeed,
    visibleRingIds,
    newRingIds,
    highlightedRingIds,
    currentStepData,
    totalSteps,
    canGoNext,
    canGoPrev,
    play,
    pause,
    togglePlay,
    nextStep,
    prevStep,
    goToStep,
    reset,
    setPlaybackSpeed,
  };
}
