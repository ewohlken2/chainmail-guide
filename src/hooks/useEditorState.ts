import { useState, useCallback, useEffect, useRef } from "react";
import type {
  RingGeometry,
  ChainmailTutorial,
  TutorialStep,
  WeaveMetadata,
  CameraConfig,
} from "@/types/tutorial";

export type TransformMode = "translate" | "rotate";

interface EditorState {
  rings: RingGeometry[];
  steps: TutorialStep[];
  metadata: WeaveMetadata;
  defaultCamera: CameraConfig;
  scale: number;
  version: string;
  selectedRingId: string | null;
  transformMode: TransformMode;
  hiddenRingIds: Set<string>;
  canUndo: boolean;
  canRedo: boolean;
}

interface UseEditorStateOptions {
  initialRings?: RingGeometry[];
  baseTutorial?: ChainmailTutorial;
}

interface UseEditorStateReturn {
  rings: RingGeometry[];
  steps: TutorialStep[];
  metadata: WeaveMetadata;
  defaultCamera: CameraConfig;
  scale: number;
  version: string;
  visibleRings: RingGeometry[];
  selectedRingId: string | null;
  selectedRing: RingGeometry | null;
  transformMode: TransformMode;
  hiddenRingIds: Set<string>;
  canUndo: boolean;
  canRedo: boolean;
  selectRing: (id: string | null) => void;
  updateRing: (id: string, updates: Partial<RingGeometry>) => void;
  updateRingTransform: (
    id: string,
    position: [number, number, number],
    rotation: [number, number, number],
    skipHistory?: boolean
  ) => void;
  addRing: () => void;
  duplicateRing: (id: string) => void;
  deleteRing: (id: string) => void;
  setTransformMode: (mode: TransformMode) => void;
  setRings: (rings: RingGeometry[]) => void;
  setSteps: (steps: TutorialStep[]) => void;
  updateStep: (stepNumber: number, updates: Partial<TutorialStep>) => void;
  addStep: () => void;
  deleteStep: (stepNumber: number) => void;
  setMetadata: (metadata: WeaveMetadata) => void;
  updateMetadata: (updates: Partial<WeaveMetadata>) => void;
  setDefaultCamera: (camera: CameraConfig) => void;
  setScale: (scale: number) => void;
  setVersion: (version: string) => void;
  toggleRingVisibility: (id: string) => void;
  hideOtherRings: (id: string) => void;
  showAllRings: () => void;
  invertRingRotation: (id: string) => void;
  invertRingRotationX: (id: string) => void;
  invertRingRotationY: (id: string) => void;
  invertRingRotationZ: (id: string) => void;
  undo: () => void;
  redo: () => void;
  exportJSON: () => string;
}

const DEFAULT_RING: Omit<RingGeometry, "id"> = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  innerDiameter: 0.6,
  outerDiameter: 0.8,
  wireGauge: 0.1,
  colorRole: "connector",
  startsOpen: true,
};

let ringCounter = 1;

function generateRingId(): string {
  return `ring-${++ringCounter}`;
}

function generateStepsFromRings(rings: RingGeometry[]): TutorialStep[] {
  return rings.map((ring, index) => {
    const stepNumber = index + 1;
    const isFirst = index === 0;
    const isSeed = ring.colorRole === "seed";

    return {
      stepNumber,
      title:
        isFirst || isSeed
          ? "Start with the Seed Ring"
          : `Add Ring ${stepNumber}`,
      description:
        isFirst || isSeed
          ? "Begin with a single closed ring positioned at the center."
          : `Add ring ${ring.id} to the weave.`,
      ringsToAdd: [ring.id],
      ringsToHighlight: index > 0 ? [rings[0].id] : undefined,
      tips:
        isFirst || isSeed
          ? ["This is the starting ring of the weave"]
          : ["Thread this ring through the connected rings"],
    };
  });
}

const DEFAULT_METADATA: WeaveMetadata = {
  id: "custom-weave",
  name: "Custom Weave",
  difficulty: "beginner",
  description: "A custom chainmail weave created in the editor.",
  tags: ["custom"],
};

const DEFAULT_CAMERA: CameraConfig = {
  position: [0, 3, 6],
  target: [0, 0, 0],
  fov: 50,
};

const MAX_HISTORY_SIZE = 50;

export function useEditorState(
  options: UseEditorStateOptions = {}
): UseEditorStateReturn {
  const { initialRings = [], baseTutorial } = options;
  const baseTutorialRef = useRef(baseTutorial);
  const historyRef = useRef<RingGeometry[][]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoRef = useRef(false);

  // Update ref when baseTutorial changes
  useEffect(() => {
    baseTutorialRef.current = baseTutorial;
  }, [baseTutorial]);

  const [state, setState] = useState<EditorState>({
    rings: initialRings,
    steps: baseTutorial?.steps ?? generateStepsFromRings(initialRings),
    metadata: baseTutorial?.metadata ?? DEFAULT_METADATA,
    defaultCamera: baseTutorial?.defaultCamera ?? DEFAULT_CAMERA,
    scale: baseTutorial?.scale ?? 1.0,
    version: baseTutorial?.version ?? "1.0.0",
    selectedRingId: null,
    transformMode: "translate",
    hiddenRingIds: new Set(),
    canUndo: false,
    canRedo: false,
  });

  // Helper function to update canUndo/canRedo state
  const updateUndoRedoState = useCallback(() => {
    const canUndo = historyIndexRef.current > 0;
    const canRedo = historyIndexRef.current < historyRef.current.length - 1;
    setState((s) => ({ ...s, canUndo, canRedo }));
  }, []);

  // Save new state to history (unless it's an undo/redo operation)
  const saveToHistory = useCallback(
    (newRings: RingGeometry[]) => {
      if (isUndoRedoRef.current) {
        return; // Don't save history during undo/redo
      }

      const ringsSnapshot = JSON.parse(JSON.stringify(newRings));
      const currentIndex = historyIndexRef.current;

      // Remove any history after current index (when undoing then making new changes)
      historyRef.current = historyRef.current.slice(0, currentIndex + 1);

      // Add new state to history
      historyRef.current.push(ringsSnapshot);

      // Limit history size
      if (historyRef.current.length > MAX_HISTORY_SIZE) {
        historyRef.current.shift();
        historyIndexRef.current = historyRef.current.length - 1;
      } else {
        historyIndexRef.current = historyRef.current.length - 1;
      }

      // Update undo/redo state
      updateUndoRedoState();
    },
    [updateUndoRedoState]
  );

  // Track previous values to detect actual changes
  const prevInitialRingsRef = useRef<string | null>(null);
  const prevBaseTutorialRef = useRef<string | null>(null);
  const isInitialMountRef = useRef(true);

  // Update state when baseTutorial or initialRings changes (only when content actually changes)
  useEffect(() => {
    const currentRingsKey = JSON.stringify(initialRings);
    const currentTutorialKey = baseTutorial
      ? JSON.stringify({
          steps: baseTutorial.steps,
          metadata: baseTutorial.metadata,
          defaultCamera: baseTutorial.defaultCamera,
          scale: baseTutorial.scale,
          version: baseTutorial.version,
        })
      : "";

    // On initial mount, always initialize
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevInitialRingsRef.current = currentRingsKey;
      prevBaseTutorialRef.current = currentTutorialKey;

      // Initialize history
      historyRef.current = [JSON.parse(JSON.stringify(initialRings))];
      historyIndexRef.current = 0;

      // Update undo/redo state in the initial state
      // State is already initialized with canUndo: false, canRedo: false which is correct for initial state

      // Update counter to avoid ID collisions
      const maxId = initialRings.reduce((max, ring) => {
        const match = ring.id.match(/ring-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);
      ringCounter = maxId;

      return; // State is already initialized correctly in useState
    }

    // Only update if the content actually changed
    if (
      prevInitialRingsRef.current === currentRingsKey &&
      prevBaseTutorialRef.current === currentTutorialKey
    ) {
      return;
    }

    prevInitialRingsRef.current = currentRingsKey;
    prevBaseTutorialRef.current = currentTutorialKey;

    setState((s) => ({
      ...s,
      rings: initialRings,
      steps: baseTutorial?.steps ?? generateStepsFromRings(initialRings),
      metadata: baseTutorial?.metadata ?? DEFAULT_METADATA,
      defaultCamera: baseTutorial?.defaultCamera ?? DEFAULT_CAMERA,
      scale: baseTutorial?.scale ?? 1.0,
      version: baseTutorial?.version ?? "1.0.0",
    }));

    // Update counter to avoid ID collisions
    const maxId = initialRings.reduce((max, ring) => {
      const match = ring.id.match(/ring-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    ringCounter = maxId;

    // Reset history when tutorial changes
    historyRef.current = [JSON.parse(JSON.stringify(initialRings))];
    historyIndexRef.current = 0;

    // Update undo/redo state
    setState((s) => ({ ...s, canUndo: false, canRedo: false }));
  }, [initialRings, baseTutorial]);

  const selectedRing =
    state.rings.find((r) => r.id === state.selectedRingId) ?? null;
  const visibleRings = state.rings.filter(
    (r) => !state.hiddenRingIds.has(r.id)
  );

  // Use state values for canUndo/canRedo (computed from refs but stored in state)
  const canUndo = state.canUndo;
  const canRedo = state.canRedo;

  const selectRing = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedRingId: id }));
  }, []);

  const updateRing = useCallback(
    (id: string, updates: Partial<RingGeometry>) => {
      setState((s) => {
        const newRings = s.rings.map((ring) =>
          ring.id === id ? { ...ring, ...updates } : ring
        );
        saveToHistory(newRings);
        return { ...s, rings: newRings };
      });
    },
    [saveToHistory]
  );

  const updateRingTransform = useCallback(
    (
      id: string,
      position: [number, number, number],
      rotation: [number, number, number],
      skipHistory: boolean = false
    ) => {
      setState((s) => {
        const newRings = s.rings.map((ring) =>
          ring.id === id ? { ...ring, position, rotation } : ring
        );

        // Only save to history if not skipping (i.e., not during drag)
        if (!skipHistory) {
          saveToHistory(newRings);
        }

        return { ...s, rings: newRings };
      });
    },
    [saveToHistory]
  );

  const addRing = useCallback(() => {
    setState((s) => {
      const newRing: RingGeometry = {
        ...DEFAULT_RING,
        id: generateRingId(),
        position: [0, 0.5, 0], // Slightly above origin
      };
      const newRings = [...s.rings, newRing];
      saveToHistory(newRings);
      return {
        ...s,
        rings: newRings,
        selectedRingId: newRing.id,
      };
    });
  }, [saveToHistory]);

  const duplicateRing = useCallback(
    (id: string) => {
      setState((s) => {
        const ringToDuplicate = s.rings.find((r) => r.id === id);
        if (!ringToDuplicate) return s;

        const newRing: RingGeometry = {
          ...ringToDuplicate,
          id: generateRingId(),
          position: [
            ringToDuplicate.position[0] + 0.3,
            ringToDuplicate.position[1],
            ringToDuplicate.position[2],
          ],
        };
        const newRings = [...s.rings, newRing];
        saveToHistory(newRings);
        return {
          ...s,
          rings: newRings,
          selectedRingId: newRing.id,
        };
      });
    },
    [saveToHistory]
  );

  const deleteRing = useCallback(
    (id: string) => {
      setState((s) => {
        const newRings = s.rings.filter((ring) => ring.id !== id);
        saveToHistory(newRings);
        return {
          ...s,
          rings: newRings,
          selectedRingId: s.selectedRingId === id ? null : s.selectedRingId,
        };
      });
    },
    [saveToHistory]
  );

  const setTransformMode = useCallback((mode: TransformMode) => {
    setState((s) => ({ ...s, transformMode: mode }));
  }, []);

  const setRings = useCallback(
    (rings: RingGeometry[]) => {
      setState((s) => {
        saveToHistory(rings);
        return { ...s, rings };
      });
    },
    [saveToHistory]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0 && historyRef.current.length > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const previousRings = JSON.parse(
        JSON.stringify(historyRef.current[historyIndexRef.current])
      );

      setState((s) => {
        const canUndo = historyIndexRef.current > 0;
        const canRedo = historyIndexRef.current < historyRef.current.length - 1;
        return { ...s, rings: previousRings, canUndo, canRedo };
      });

      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const nextRings = JSON.parse(
        JSON.stringify(historyRef.current[historyIndexRef.current])
      );

      setState((s) => {
        const canUndo = historyIndexRef.current > 0;
        const canRedo = historyIndexRef.current < historyRef.current.length - 1;
        return { ...s, rings: nextRings, canUndo, canRedo };
      });

      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, []);

  const setSteps = useCallback((steps: TutorialStep[]) => {
    setState((s) => ({ ...s, steps }));
  }, []);

  const updateStep = useCallback(
    (stepNumber: number, updates: Partial<TutorialStep>) => {
      setState((s) => ({
        ...s,
        steps: s.steps.map((step) =>
          step.stepNumber === stepNumber ? { ...step, ...updates } : step
        ),
      }));
    },
    []
  );

  const addStep = useCallback(() => {
    setState((s) => {
      const newStepNumber =
        s.steps.length > 0
          ? Math.max(...s.steps.map((s) => s.stepNumber)) + 1
          : 1;
      const newStep: TutorialStep = {
        stepNumber: newStepNumber,
        title: `Step ${newStepNumber}`,
        description: "",
        ringsToAdd: [],
      };
      return { ...s, steps: [...s.steps, newStep] };
    });
  }, []);

  const deleteStep = useCallback((stepNumber: number) => {
    setState((s) => ({
      ...s,
      steps: s.steps
        .filter((step) => step.stepNumber !== stepNumber)
        .map((step, index) => ({ ...step, stepNumber: index + 1 })),
    }));
  }, []);

  const setMetadata = useCallback((metadata: WeaveMetadata) => {
    setState((s) => ({ ...s, metadata }));
  }, []);

  const updateMetadata = useCallback((updates: Partial<WeaveMetadata>) => {
    setState((s) => ({ ...s, metadata: { ...s.metadata, ...updates } }));
  }, []);

  const setDefaultCamera = useCallback((camera: CameraConfig) => {
    setState((s) => ({ ...s, defaultCamera: camera }));
  }, []);

  const setScale = useCallback((scale: number) => {
    setState((s) => ({ ...s, scale }));
  }, []);

  const setVersion = useCallback((version: string) => {
    setState((s) => ({ ...s, version }));
  }, []);

  const exportJSON = useCallback(() => {
    const tutorial: ChainmailTutorial = {
      version: state.version,
      metadata: state.metadata,
      defaultCamera: state.defaultCamera,
      scale: state.scale,
      rings: state.rings,
      steps: state.steps,
    };

    return JSON.stringify(tutorial, null, 2);
  }, [state]);

  const toggleRingVisibility = useCallback((id: string) => {
    setState((s) => {
      const newHidden = new Set(s.hiddenRingIds);
      if (newHidden.has(id)) {
        newHidden.delete(id);
      } else {
        newHidden.add(id);
      }
      return { ...s, hiddenRingIds: newHidden };
    });
  }, []);

  const hideOtherRings = useCallback((id: string) => {
    setState((s) => {
      const newHidden = new Set(
        s.rings.map((r) => r.id).filter((rid) => rid !== id)
      );
      return { ...s, hiddenRingIds: newHidden };
    });
  }, []);

  const showAllRings = useCallback(() => {
    setState((s) => ({ ...s, hiddenRingIds: new Set() }));
  }, []);

  const invertRingRotation = useCallback(
    (id: string) => {
      setState((s) => {
        const ring = s.rings.find((r) => r.id === id);
        if (!ring) return s;

        const newRotation: [number, number, number] = [
          -ring.rotation[0],
          -ring.rotation[1],
          -ring.rotation[2],
        ];

        const newRings = s.rings.map((r) =>
          r.id === id ? { ...r, rotation: newRotation } : r
        );
        saveToHistory(newRings);
        return { ...s, rings: newRings };
      });
    },
    [saveToHistory]
  );

  const invertRingRotationX = useCallback(
    (id: string) => {
      setState((s) => {
        const ring = s.rings.find((r) => r.id === id);
        if (!ring) return s;

        const newRotation: [number, number, number] = [
          -ring.rotation[0],
          ring.rotation[1],
          ring.rotation[2],
        ];

        const newRings = s.rings.map((r) =>
          r.id === id ? { ...r, rotation: newRotation } : r
        );
        saveToHistory(newRings);
        return { ...s, rings: newRings };
      });
    },
    [saveToHistory]
  );

  const invertRingRotationY = useCallback(
    (id: string) => {
      setState((s) => {
        const ring = s.rings.find((r) => r.id === id);
        if (!ring) return s;

        const newRotation: [number, number, number] = [
          ring.rotation[0],
          -ring.rotation[1],
          ring.rotation[2],
        ];

        const newRings = s.rings.map((r) =>
          r.id === id ? { ...r, rotation: newRotation } : r
        );
        saveToHistory(newRings);
        return { ...s, rings: newRings };
      });
    },
    [saveToHistory]
  );

  const invertRingRotationZ = useCallback(
    (id: string) => {
      setState((s) => {
        const ring = s.rings.find((r) => r.id === id);
        if (!ring) return s;

        const newRotation: [number, number, number] = [
          ring.rotation[0],
          ring.rotation[1],
          -ring.rotation[2],
        ];

        const newRings = s.rings.map((r) =>
          r.id === id ? { ...r, rotation: newRotation } : r
        );
        saveToHistory(newRings);
        return { ...s, rings: newRings };
      });
    },
    [saveToHistory]
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isModifierPressed = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Handle Ctrl+Z (undo) and Ctrl+Y/Ctrl+Shift+Z (redo) - allow even in input fields
      if (isModifierPressed && !e.shiftKey && key === "z") {
        e.preventDefault();
        e.stopPropagation();
        undo();
        return;
      }
      if (isModifierPressed && (key === "y" || (e.shiftKey && key === "z"))) {
        e.preventDefault();
        e.stopPropagation();
        redo();
        return;
      }

      // Don't handle other shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (key) {
        case "t":
          setTransformMode("translate");
          break;
        case "r":
          setTransformMode("rotate");
          break;
        case "d":
          if (state.selectedRingId) {
            e.preventDefault();
            duplicateRing(state.selectedRingId);
          }
          break;
        case "delete":
        case "backspace":
          if (state.selectedRingId) {
            e.preventDefault();
            deleteRing(state.selectedRingId);
          }
          break;
        case "escape":
          selectRing(null);
          break;
        case "i":
          if (state.selectedRingId) {
            e.preventDefault();
            invertRingRotation(state.selectedRingId);
          }
          break;
        case "x":
          if (state.selectedRingId) {
            e.preventDefault();
            invertRingRotationX(state.selectedRingId);
          }
          break;
        case "y":
          if (state.selectedRingId && !isModifierPressed) {
            // Only handle Y if no modifier, since Ctrl+Y is redo
            e.preventDefault();
            invertRingRotationY(state.selectedRingId);
          }
          break;
        case "z":
          if (state.selectedRingId && !isModifierPressed) {
            // Only handle Z if no modifier, since Ctrl+Z is undo
            e.preventDefault();
            invertRingRotationZ(state.selectedRingId);
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [
    state.selectedRingId,
    selectRing,
    setTransformMode,
    duplicateRing,
    deleteRing,
    invertRingRotation,
    invertRingRotationX,
    invertRingRotationY,
    invertRingRotationZ,
    undo,
    redo,
  ]);

  return {
    rings: state.rings,
    steps: state.steps,
    metadata: state.metadata,
    defaultCamera: state.defaultCamera,
    scale: state.scale,
    version: state.version,
    visibleRings,
    selectedRingId: state.selectedRingId,
    selectedRing,
    transformMode: state.transformMode,
    hiddenRingIds: state.hiddenRingIds,
    canUndo,
    canRedo,
    selectRing,
    updateRing,
    updateRingTransform,
    addRing,
    duplicateRing,
    deleteRing,
    setTransformMode,
    setRings,
    setSteps,
    updateStep,
    addStep,
    deleteStep,
    setMetadata,
    updateMetadata,
    setDefaultCamera,
    setScale,
    setVersion,
    toggleRingVisibility,
    hideOtherRings,
    showAllRings,
    invertRingRotation,
    invertRingRotationX,
    invertRingRotationY,
    invertRingRotationZ,
    undo,
    redo,
    exportJSON,
  };
}
