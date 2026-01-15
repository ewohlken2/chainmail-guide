import { useState } from 'react';
import { ChainmailScene } from './components/scene/ChainmailScene';
import { EditorScene } from './components/scene/EditorScene';
import { TutorialPlayer } from './components/ui/TutorialPlayer';
import { EditorPanel } from './components/editor/EditorPanel';
import { useWeaveLoader } from './hooks/useWeaveLoader';
import { useTutorialPlayer } from './hooks/useTutorialPlayer';
import { useEditorState } from './hooks/useEditorState';
import './index.css';

type AppMode = 'tutorial' | 'editor';

function App() {
  const [mode, setMode] = useState<AppMode>('tutorial');
  const { tutorial, isLoading, error } = useWeaveLoader('european-4-in-1');

  const player = useTutorialPlayer({ tutorial });
  const editor = useEditorState(tutorial?.rings ?? []);

  const handleExport = () => {
    const json = editor.exportJSON();
    navigator.clipboard.writeText(json).then(() => {
      alert('Ring data copied to clipboard!');
    }).catch(() => {
      // Fallback: show in console
      console.log('Ring data:\n', json);
      alert('Check console for ring data (clipboard not available)');
    });
  };

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
        <div className="mode-toggle">
          <button
            className={mode === 'tutorial' ? 'active' : ''}
            onClick={() => setMode('tutorial')}
          >
            Tutorial
          </button>
          <button
            className={mode === 'editor' ? 'active' : ''}
            onClick={() => setMode('editor')}
          >
            Editor
          </button>
        </div>
      </header>

      <div className="main-content">
        {mode === 'tutorial' ? (
          <>
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
          </>
        ) : (
          <>
            <div className="scene-container">
              <EditorScene
                rings={editor.rings}
                selectedRingId={editor.selectedRingId}
                transformMode={editor.transformMode}
                onSelectRing={editor.selectRing}
                onTransformChange={editor.updateRingTransform}
              />
            </div>
            <EditorPanel
              rings={editor.rings}
              selectedRing={editor.selectedRing}
              transformMode={editor.transformMode}
              onSetTransformMode={editor.setTransformMode}
              onUpdateRing={editor.updateRing}
              onAddRing={editor.addRing}
              onDeleteRing={editor.deleteRing}
              onDuplicateRing={editor.duplicateRing}
              onExport={handleExport}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
