import type { TransformMode } from '@/hooks/useEditorState';

interface EditorToolbarProps {
  transformMode: TransformMode;
  hasSelection: boolean;
  onSetTransformMode: (mode: TransformMode) => void;
  onAddRing: () => void;
  onDeleteRing: () => void;
  onDuplicateRing: () => void;
  onSave: () => void;
}

export function EditorToolbar({
  transformMode,
  hasSelection,
  onSetTransformMode,
  onAddRing,
  onDeleteRing,
  onDuplicateRing,
  onSave,
}: EditorToolbarProps) {
  return (
    <div className="editor-toolbar">
      <div className="toolbar-section">
        <button className="toolbar-btn primary" onClick={onAddRing} title="Add new ring">
          + Add Ring
        </button>
        <button
          className="toolbar-btn"
          onClick={onDuplicateRing}
          disabled={!hasSelection}
          title="Duplicate selected (D)"
        >
          Duplicate
        </button>
        <button
          className="toolbar-btn danger"
          onClick={onDeleteRing}
          disabled={!hasSelection}
          title="Delete selected (Del)"
        >
          Delete
        </button>
      </div>

      <div className="toolbar-section">
        <span className="toolbar-label">Transform:</span>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${transformMode === 'translate' ? 'active' : ''}`}
            onClick={() => onSetTransformMode('translate')}
            title="Move (T)"
          >
            Move
          </button>
          <button
            className={`toggle-btn ${transformMode === 'rotate' ? 'active' : ''}`}
            onClick={() => onSetTransformMode('rotate')}
            title="Rotate (R)"
          >
            Rotate
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <button className="toolbar-btn export" onClick={onSave} title="Save tutorial JSON file">
          Save JSON
        </button>
      </div>
    </div>
  );
}
