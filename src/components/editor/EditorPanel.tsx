import { EditorToolbar } from './EditorToolbar';
import { RingForm } from './RingForm';
import type { RingGeometry } from '@/types/tutorial';
import type { TransformMode } from '@/hooks/useEditorState';

interface EditorPanelProps {
  rings: RingGeometry[];
  selectedRing: RingGeometry | null;
  transformMode: TransformMode;
  onSetTransformMode: (mode: TransformMode) => void;
  onUpdateRing: (id: string, updates: Partial<RingGeometry>) => void;
  onAddRing: () => void;
  onDeleteRing: (id: string) => void;
  onDuplicateRing: (id: string) => void;
  onExport: () => void;
}

export function EditorPanel({
  rings,
  selectedRing,
  transformMode,
  onSetTransformMode,
  onUpdateRing,
  onAddRing,
  onDeleteRing,
  onDuplicateRing,
  onExport,
}: EditorPanelProps) {
  const handleExport = () => {
    onExport();
  };

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <h2>Ring Editor</h2>
        <span className="ring-count">{rings.length} rings</span>
      </div>

      <EditorToolbar
        transformMode={transformMode}
        hasSelection={!!selectedRing}
        onSetTransformMode={onSetTransformMode}
        onAddRing={onAddRing}
        onDeleteRing={() => selectedRing && onDeleteRing(selectedRing.id)}
        onDuplicateRing={() => selectedRing && onDuplicateRing(selectedRing.id)}
        onExport={handleExport}
      />

      <div className="editor-content">
        {selectedRing ? (
          <>
            <div className="selected-info">
              <span className="label">Selected:</span>
              <span className="ring-id">{selectedRing.id}</span>
            </div>
            <RingForm
              ring={selectedRing}
              onUpdate={updates => onUpdateRing(selectedRing.id, updates)}
            />
          </>
        ) : (
          <div className="no-selection">
            <p>Click a ring to select it</p>
            <p className="hint">Or press + Add Ring to create one</p>
          </div>
        )}
      </div>

      <div className="editor-shortcuts">
        <h4>Keyboard Shortcuts</h4>
        <ul>
          <li><kbd>T</kbd> Translate mode</li>
          <li><kbd>R</kbd> Rotate mode</li>
          <li><kbd>D</kbd> Duplicate</li>
          <li><kbd>Del</kbd> Delete</li>
          <li><kbd>Esc</kbd> Deselect</li>
        </ul>
      </div>
    </div>
  );
}
