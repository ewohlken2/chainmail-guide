import { ChainmailScene } from './components/scene/ChainmailScene';
import { TutorialPlayer } from './components/ui/TutorialPlayer';
import { useWeaveLoader } from './hooks/useWeaveLoader';
import { useTutorialPlayer } from './hooks/useTutorialPlayer';
import './index.css';

function App() {
  const { tutorial, isLoading, error } = useWeaveLoader('european-4-in-1');

  const player = useTutorialPlayer({ tutorial });

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Loading tutorial...</div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="app">
        <div className="error">
          Failed to load tutorial: {error?.message ?? 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Chainmail Guide</h1>
        <span>3D Tutorial Engine</span>
      </header>

      <div className="main-content">
        <div className="scene-container">
          <ChainmailScene
            tutorial={tutorial}
            visibleRingIds={player.visibleRingIds}
            newRingIds={player.newRingIds}
            highlightedRingIds={player.highlightedRingIds}
          />
        </div>

        <TutorialPlayer
          tutorial={tutorial}
          currentStep={player.currentStep}
          totalSteps={player.totalSteps}
          currentStepData={player.currentStepData}
          isPlaying={player.isPlaying}
          canGoNext={player.canGoNext}
          canGoPrev={player.canGoPrev}
          onPlay={player.play}
          onPause={player.pause}
          onNext={player.nextStep}
          onPrev={player.prevStep}
          onReset={player.reset}
          onStepClick={player.goToStep}
        />
      </div>
    </div>
  );
}

export default App;
