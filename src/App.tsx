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
import type {
  ChainmailTutorial,
  TutorialIndex as TutorialIndexType,
} from "./types/tutorial";
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
  // Store file handles for automatic saving
  const [tutorialFileHandle, setTutorialFileHandle] = useState<any>(null);
  const [indexFileHandle, setIndexFileHandle] = useState<any>(null);

  const {
    tutorials,
    isLoading: indexLoading,
    addTutorial,
    saveTutorial,
    updateIndexEntry,
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
    // Clear file handles when switching tutorials
    setTutorialFileHandle(null);
    setIndexFileHandle(null);
  };

  const handleCreateNew = (name: string) => {
    const newTutorial = addTutorial(name);
    setCustomTutorial(newTutorial);
    setSelectedTutorialId(null);
    setShowNewModal(false);
    setView("editor");
    // Clear file handles for new tutorial
    setTutorialFileHandle(null);
    setIndexFileHandle(null);
  };

  const handleBackToIndex = () => {
    setView("index");
    setSelectedTutorialId(null);
    setCustomTutorial(null);
    // Clear file handles when going back
    setTutorialFileHandle(null);
    setIndexFileHandle(null);
  };

  const handleSave = async () => {
    const tutorialData: ChainmailTutorial = {
      version: editor.version,
      metadata: editor.metadata,
      defaultCamera: editor.defaultCamera,
      scale: editor.scale,
      rings: editor.rings,
      steps: editor.steps,
    };

    // Check if this is a new tutorial (customTutorial with no selectedTutorialId)
    const isNew = customTutorial !== null && selectedTutorialId === null;

    // Check if we need to overwrite existing files
    const willOverwriteTutorial = tutorialFileHandle !== null || !isNew;
    const willOverwriteIndex = indexFileHandle !== null || isNew;

    // Show confirmation if files will be overwritten
    if (willOverwriteTutorial || willOverwriteIndex) {
      const filesToOverwrite: string[] = [];
      if (willOverwriteTutorial) {
        filesToOverwrite.push(`${tutorialData.metadata.id}.json`);
      }
      if (willOverwriteIndex) {
        filesToOverwrite.push("index.json");
      }

      const confirmed = window.confirm(
        `This will overwrite the following file(s):\n\n${filesToOverwrite.join(
          "\n"
        )}\n\nDo you want to continue?`
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      // Prepare index data
      let indexData: TutorialIndexType;
      if (!isNew && selectedTutorialId) {
        const existingTutorial = tutorials.find(
          (t) => t.id === selectedTutorialId
        );
        if (existingTutorial) {
          const metadataChanged =
            existingTutorial.name !== tutorialData.metadata.name ||
            existingTutorial.difficulty !== tutorialData.metadata.difficulty;

          if (metadataChanged) {
            updateIndexEntry(selectedTutorialId, {
              name: tutorialData.metadata.name,
              difficulty: tutorialData.metadata.difficulty,
            });
          }

          indexData = {
            version: "1.0.0",
            tutorials: tutorials.map((t) =>
              t.id === selectedTutorialId
                ? {
                    ...t,
                    name: tutorialData.metadata.name,
                    difficulty: tutorialData.metadata.difficulty,
                  }
                : t
            ),
          };
        } else {
          indexData = {
            version: "1.0.0",
            tutorials: tutorials,
          };
        }
      } else if (isNew) {
        // For new tutorials, add to index
        updateIndexEntry(tutorialData.metadata.id, {
          id: tutorialData.metadata.id,
          file: `${tutorialData.metadata.id}.json`,
          name: tutorialData.metadata.name,
          difficulty: tutorialData.metadata.difficulty,
        });
        indexData = {
          version: "1.0.0",
          tutorials: [
            ...tutorials,
            {
              id: tutorialData.metadata.id,
              file: `${tutorialData.metadata.id}.json`,
              name: tutorialData.metadata.name,
              difficulty: tutorialData.metadata.difficulty,
            },
          ],
        };
      } else {
        indexData = {
          version: "1.0.0",
          tutorials: tutorials,
        };
      }

      // Save both files
      const newTutorialHandle = await saveTutorial(
        tutorialData,
        isNew,
        tutorialFileHandle
      );
      const newIndexHandle = await saveIndexFile(indexData, indexFileHandle);

      // Store file handles for next save
      if (newTutorialHandle) {
        setTutorialFileHandle(newTutorialHandle);
      }
      if (newIndexHandle) {
        setIndexFileHandle(newIndexHandle);
      }

      alert("Tutorial saved successfully!");
    } catch (error) {
      console.error("Error saving tutorial:", error);
      alert("Failed to save tutorial. Check the console for details.");
    }
  };

  const saveIndexFile = async (
    indexData: TutorialIndexType,
    existingHandle?: any
  ): Promise<any> => {
    const json = JSON.stringify(indexData, null, 2);

    // Try File System Access API
    // @ts-expect-error - File System Access API types not fully available
    if (window.showSaveFilePicker) {
      try {
        let fileHandle = existingHandle;

        // If we have an existing handle, use it; otherwise ask for a new one
        if (!fileHandle) {
          // @ts-expect-error - File System Access API
          fileHandle = await window.showSaveFilePicker({
            suggestedName: "index.json",
            types: [
              {
                description: "JSON files",
                accept: { "application/json": [".json"] },
              },
            ],
          });
        }

        const writable = await fileHandle.createWritable();
        await writable.write(json);
        await writable.close();
        return fileHandle;
      } catch (err) {
        if ((err as any).name !== "AbortError") {
          console.error("Error saving index file:", err);
        }
        throw err;
      }
    }

    // Fallback: Download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return null;
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
              onUpdateStep={editor.updateStep}
              onAddStep={editor.addStep}
              onDeleteStep={editor.deleteStep}
              onUpdateMetadata={editor.updateMetadata}
              onUpdateCamera={editor.setDefaultCamera}
              onUpdateScale={editor.setScale}
              onUpdateVersion={editor.setVersion}
              onSave={handleSave}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
