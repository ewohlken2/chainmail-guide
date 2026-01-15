import { useState } from "react";
import { ChainmailScene } from "./components/scene/ChainmailScene";
import { EditorScene } from "./components/scene/EditorScene";
import { TutorialPlayer } from "./components/ui/TutorialPlayer";
import { TutorialIndex } from "./components/ui/TutorialIndex";
import { NewTutorialModal } from "./components/ui/NewTutorialModal";
import { EditorPanel } from "./components/editor/EditorPanel";
import { useWeaveLoader } from "./hooks/useWeaveLoader";
import { useTutorialPlayer } from "./hooks/useTutorialPlayer";
import { useEditorState } from "./hooks/useEditorState";
import { useTutorialIndex } from "./hooks/useTutorialIndex";
import type { ChainmailTutorial } from "./types/tutorial";
import "./index.css";

type AppView = "index" | "tutorial" | "editor";

function App() {
  const [view, setView] = useState<AppView>("index");
  const [selectedTutorialId, setSelectedTutorialId] = useState<string | null>(
    null
  );
  const [customTutorial, setCustomTutorial] =
    useState<ChainmailTutorial | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const {
    tutorials,
    isLoading: indexLoading,
    addTutorial,
  } = useTutorialIndex();
  const {
    tutorial: loadedTutorial,
    isLoading: tutorialLoading,
    error,
  } = useWeaveLoader(selectedTutorialId ?? "");

  // Use custom tutorial if set, otherwise use loaded tutorial
  const tutorial = customTutorial ?? loadedTutorial;

  const player = useTutorialPlayer({ tutorial });
  const editor = useEditorState({
    initialRings: tutorial?.rings ?? [],
    baseTutorial: tutorial ?? undefined,
  });

  const handleSelectTutorial = (id: string) => {
    setCustomTutorial(null);
    setSelectedTutorialId(id);
    setView("tutorial");
  };

  const handleCreateNew = (name: string) => {
    const newTutorial = addTutorial(name);
    setCustomTutorial(newTutorial);
    setSelectedTutorialId(null);
    setShowNewModal(false);
    setView("editor");
  };

  const handleBackToIndex = () => {
    setView("index");
    setSelectedTutorialId(null);
    setCustomTutorial(null);
  };

  const handleExport = () => {
    const json = editor.exportJSON();
    navigator.clipboard
      .writeText(json)
      .then(() => {
        alert("Tutorial JSON copied to clipboard!");
      })
      .catch(() => {
        console.log("Tutorial JSON:\n", json);
        alert("Check console for tutorial JSON (clipboard not available)");
      });
  };

  // Index view
  if (view === "index") {
    return (
      <div className="app">
        <header className="header">
          <h1>Chainmail Guide</h1>
        </header>

        <div className="main-content index-content">
          {indexLoading ? (
            <div className="loading">Loading tutorials...</div>
          ) : (
            <TutorialIndex
              tutorials={tutorials}
              onSelectTutorial={handleSelectTutorial}
              onCreateNew={() => setShowNewModal(true)}
            />
          )}
        </div>

        <NewTutorialModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateNew}
        />
      </div>
    );
  }

  // Loading state for tutorial/editor views
  const isLoading = selectedTutorialId ? tutorialLoading : false;

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Loading tutorial...</div>
      </div>
    );
  }

  if (error && selectedTutorialId) {
    return (
      <div className="app">
        <div className="error">
          Failed to load tutorial: {error?.message ?? "Unknown error"}
          <button onClick={handleBackToIndex} style={{ marginTop: "1rem" }}>
            Back to Index
          </button>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="app">
        <div className="error">
          No tutorial loaded
          <button onClick={handleBackToIndex} style={{ marginTop: "1rem" }}>
            Back to Index
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <button className="back-btn" onClick={handleBackToIndex}>
          ← Back
        </button>
        <h1>{tutorial.metadata.name}</h1>
        <div className="mode-toggle">
          <button
            className={view === "tutorial" ? "active" : ""}
            onClick={() => setView("tutorial")}
          >
            Tutorial
          </button>
          <button
            className={view === "editor" ? "active" : ""}
            onClick={() => setView("editor")}
          >
            Editor
          </button>
        </div>
      </header>

      <div className="main-content">
        {view === "tutorial" ? (
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
                rings={editor.visibleRings}
                selectedRingId={editor.selectedRingId}
                transformMode={editor.transformMode}
                onSelectRing={editor.selectRing}
                onTransformChange={editor.updateRingTransform}
              />
            </div>
            <EditorPanel
              rings={editor.rings}
              steps={editor.steps}
              metadata={editor.metadata}
              defaultCamera={editor.defaultCamera}
              scale={editor.scale}
              version={editor.version}
              selectedRing={editor.selectedRing}
              transformMode={editor.transformMode}
              hiddenRingIds={editor.hiddenRingIds}
              onSetTransformMode={editor.setTransformMode}
              onUpdateRing={editor.updateRing}
              onAddRing={editor.addRing}
              onDeleteRing={editor.deleteRing}
              onDuplicateRing={editor.duplicateRing}
              onSelectRing={editor.selectRing}
              onToggleVisibility={editor.toggleRingVisibility}
              onHideOthers={editor.hideOtherRings}
              onShowAll={editor.showAllRings}
              onInvertRotation={editor.invertRingRotation}
              onUpdateStep={editor.updateStep}
              onAddStep={editor.addStep}
              onDeleteStep={editor.deleteStep}
              onUpdateMetadata={editor.updateMetadata}
              onUpdateCamera={editor.setDefaultCamera}
              onUpdateScale={editor.setScale}
              onUpdateVersion={editor.setVersion}
              onExport={handleExport}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
