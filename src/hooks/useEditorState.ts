import { useState, useCallback, useEffect } from 'react';
import type { RingGeometry } from '@/types/tutorial';

export type TransformMode = 'translate' | 'rotate';

interface EditorState {
  rings: RingGeometry[];
  selectedRingId: string | null;
  transformMode: TransformMode;
}

interface UseEditorStateReturn {
  rings: RingGeometry[];
  selectedRingId: string | null;
  selectedRing: RingGeometry | null;
  transformMode: TransformMode;
  selectRing: (id: string | null) => void;
  updateRing: (id: string, updates: Partial<RingGeometry>) => void;
  updateRingTransform: (id: string, position: [number, number, number], rotation: [number, number, number]) => void;
  addRing: () => void;
  duplicateRing: (id: string) => void;
  deleteRing: (id: string) => void;
  setTransformMode: (mode: TransformMode) => void;
  setRings: (rings: RingGeometry[]) => void;
  exportJSON: () => string;
}

const DEFAULT_RING: Omit<RingGeometry, 'id'> = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  innerDiameter: 0.6,
  outerDiameter: 0.8,
  wireGauge: 0.1,
  colorRole: 'connector',
  startsOpen: true,
};

let ringCounter = 1;

function generateRingId(): string {
  return `ring-${++ringCounter}`;
}

export function useEditorState(initialRings: RingGeometry[] = []): UseEditorStateReturn {
  const [state, setState] = useState<EditorState>({
    rings: initialRings,
    selectedRingId: null,
    transformMode: 'translate',
  });

  // Update rings when initialRings changes
  useEffect(() => {
    setState(s => ({ ...s, rings: initialRings }));
    // Update counter to avoid ID collisions
    const maxId = initialRings.reduce((max, ring) => {
      const match = ring.id.match(/ring-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    ringCounter = maxId;
  }, [initialRings]);

  const selectedRing = state.rings.find(r => r.id === state.selectedRingId) ?? null;

  const selectRing = useCallback((id: string | null) => {
    setState(s => ({ ...s, selectedRingId: id }));
  }, []);

  const updateRing = useCallback((id: string, updates: Partial<RingGeometry>) => {
    setState(s => ({
      ...s,
      rings: s.rings.map(ring =>
        ring.id === id ? { ...ring, ...updates } : ring
      ),
    }));
  }, []);

  const updateRingTransform = useCallback((
    id: string,
    position: [number, number, number],
    rotation: [number, number, number]
  ) => {
    setState(s => ({
      ...s,
      rings: s.rings.map(ring =>
        ring.id === id ? { ...ring, position, rotation } : ring
      ),
    }));
  }, []);

  const addRing = useCallback(() => {
    const newRing: RingGeometry = {
      ...DEFAULT_RING,
      id: generateRingId(),
      position: [0, 0.5, 0], // Slightly above origin
    };
    setState(s => ({
      ...s,
      rings: [...s.rings, newRing],
      selectedRingId: newRing.id,
    }));
  }, []);

  const duplicateRing = useCallback((id: string) => {
    setState(s => {
      const ringToDuplicate = s.rings.find(r => r.id === id);
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

      return {
        ...s,
        rings: [...s.rings, newRing],
        selectedRingId: newRing.id,
      };
    });
  }, []);

  const deleteRing = useCallback((id: string) => {
    setState(s => ({
      ...s,
      rings: s.rings.filter(ring => ring.id !== id),
      selectedRingId: s.selectedRingId === id ? null : s.selectedRingId,
    }));
  }, []);

  const setTransformMode = useCallback((mode: TransformMode) => {
    setState(s => ({ ...s, transformMode: mode }));
  }, []);

  const setRings = useCallback((rings: RingGeometry[]) => {
    setState(s => ({ ...s, rings }));
  }, []);

  const exportJSON = useCallback(() => {
    return JSON.stringify(state.rings, null, 2);
  }, [state.rings]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 't':
          setTransformMode('translate');
          break;
        case 'r':
          setTransformMode('rotate');
          break;
        case 'd':
          if (state.selectedRingId) {
            e.preventDefault();
            duplicateRing(state.selectedRingId);
          }
          break;
        case 'delete':
        case 'backspace':
          if (state.selectedRingId) {
            e.preventDefault();
            deleteRing(state.selectedRingId);
          }
          break;
        case 'escape':
          selectRing(null);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedRingId, selectRing, setTransformMode, duplicateRing, deleteRing]);

  return {
    rings: state.rings,
    selectedRingId: state.selectedRingId,
    selectedRing,
    transformMode: state.transformMode,
    selectRing,
    updateRing,
    updateRingTransform,
    addRing,
    duplicateRing,
    deleteRing,
    setTransformMode,
    setRings,
    exportJSON,
  };
}
