import { useState } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { RingForm } from "./RingForm";
import { StepsEditor } from "./StepsEditor";
import { MetadataEditor } from "./MetadataEditor";
import { SettingsEditor } from "./SettingsEditor";
import type {
  RingGeometry,
  TutorialStep,
  WeaveMetadata,
  CameraConfig,
} from "@/types/tutorial";
import type { TransformMode } from "@/hooks/useEditorState";

interface EditorPanelProps {
  rings: RingGeometry[];
  steps: TutorialStep[];
  metadata: WeaveMetadata;
  defaultCamera: CameraConfig;
  scale: number;
  version: string;
  selectedRing: RingGeometry | null;
  transformMode: TransformMode;
  hiddenRingIds: Set<string>;
  onSetTransformMode: (mode: TransformMode) => void;
  onUpdateRing: (id: string, updates: Partial<RingGeometry>) => void;
  onAddRing: () => void;
  onDeleteRing: (id: string) => void;
  onDuplicateRing: (id: string) => void;
  onSelectRing: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onHideOthers: (id: string) => void;
  onShowAll: () => void;
  onInvertRotation: (id: string) => void;
  onUpdateStep: (stepNumber: number, updates: Partial<TutorialStep>) => void;
  onAddStep: () => void;
  onDeleteStep: (stepNumber: number) => void;
  onUpdateMetadata: (updates: Partial<WeaveMetadata>) => void;
  onUpdateCamera: (camera: CameraConfig) => void;
  onUpdateScale: (scale: number) => void;
  onUpdateVersion: (version: string) => void;
  onExport: () => void;
}

type AccordionSection = "rings" | "steps" | "metadata" | "settings";

export function EditorPanel({
  rings,
  steps,
  metadata,
  defaultCamera,
  scale,
  version,
  selectedRing,
  transformMode,
  hiddenRingIds,
  onSetTransformMode,
  onUpdateRing,
  onAddRing,
  onDeleteRing,
  onDuplicateRing,
  onSelectRing,
  onToggleVisibility,
  onHideOthers,
  onShowAll,
  onInvertRotation,
  onUpdateStep,
  onAddStep,
  onDeleteStep,
  onUpdateMetadata,
  onUpdateCamera,
  onUpdateScale,
  onUpdateVersion,
  onExport,
}: EditorPanelProps) {
  const hiddenCount = hiddenRingIds.size;
  const [openSections, setOpenSections] = useState<Set<AccordionSection>>(
    new Set(["rings"])
  );

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const AccordionHeader = ({
    section,
    title,
  }: {
    section: AccordionSection;
    title: string;
  }) => (
    <div className="accordion-header" onClick={() => toggleSection(section)}>
      <h3>{title}</h3>
      <span className="accordion-icon">
        {openSections.has(section) ? "▼" : "▶"}
      </span>
    </div>
  );

  return (
    <div className="editor-panel">
      <div className="editor-header">
        <h2>Editor</h2>
        <button
          className="export-btn"
          onClick={onExport}
          title="Export full JSON"
        >
          Export JSON
        </button>
      </div>

      <EditorToolbar
        transformMode={transformMode}
        hasSelection={!!selectedRing}
        onSetTransformMode={onSetTransformMode}
        onAddRing={onAddRing}
        onDeleteRing={() => selectedRing && onDeleteRing(selectedRing.id)}
        onDuplicateRing={() => selectedRing && onDuplicateRing(selectedRing.id)}
        onExport={onExport}
      />

      <div className="accordion-container">
        {/* Ring Editor Section */}
        <div className="accordion-section">
          <AccordionHeader section="rings" title="Ring Editor" />
          {openSections.has("rings") && (
            <div className="accordion-content">
              <div className="editor-content">
                {selectedRing ? (
                  <>
                    <div className="selected-info">
                      <span className="label">Selected:</span>
                      <span className="ring-id">{selectedRing.id}</span>
                    </div>

                    <div className="visibility-controls">
                      <button
                        className="visibility-btn"
                        onClick={() => onToggleVisibility(selectedRing.id)}
                        title={
                          hiddenRingIds.has(selectedRing.id)
                            ? "Show this ring"
                            : "Hide this ring"
                        }
                      >
                        {hiddenRingIds.has(selectedRing.id) ? "Show" : "Hide"}
                      </button>
                      <button
                        className="visibility-btn"
                        onClick={() => onHideOthers(selectedRing.id)}
                        title="Hide all other rings"
                      >
                        Solo
                      </button>
                      {hiddenCount > 0 && (
                        <button
                          className="visibility-btn show-all"
                          onClick={onShowAll}
                          title="Show all hidden rings"
                        >
                          Show All ({hiddenCount} hidden)
                        </button>
                      )}
                    </div>

                    <RingForm
                      ring={selectedRing}
                      onUpdate={(updates) =>
                        onUpdateRing(selectedRing.id, updates)
                      }
                    />
                  </>
                ) : (
                  <div className="no-selection">
                    <p>Click a ring to select it</p>
                    <p className="hint">Or press + Add Ring to create one</p>
                    {hiddenCount > 0 && (
                      <button
                        className="visibility-btn show-all"
                        onClick={onShowAll}
                        style={{ marginTop: "1rem" }}
                      >
                        Show All ({hiddenCount} hidden)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Ring List with visibility toggles */}
              <div className="ring-list">
                <div className="ring-list-header">
                  <h4>Rings ({rings.length})</h4>
                  {hiddenCount > 0 && (
                    <button className="show-all-small" onClick={onShowAll}>
                      Show All
                    </button>
                  )}
                </div>
                <div className="ring-list-items">
                  {rings.map((ring) => (
                    <div
                      key={ring.id}
                      className={`ring-list-item ${
                        ring.id === selectedRing?.id ? "selected" : ""
                      } ${hiddenRingIds.has(ring.id) ? "hidden" : ""}`}
                      onClick={() => onSelectRing(ring.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="ring-list-id">{ring.id}</span>
                      <span className="ring-list-role">{ring.colorRole}</span>
                      <button
                        className="ring-list-visibility"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(ring.id);
                        }}
                        title={hiddenRingIds.has(ring.id) ? "Show" : "Hide"}
                      >
                        {hiddenRingIds.has(ring.id) ? "○" : "●"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="editor-shortcuts">
                <h4>Keyboard Shortcuts</h4>
                <ul>
                  <li>
                    <kbd>Ctrl+Z</kbd> Undo
                  </li>
                  <li>
                    <kbd>Ctrl+Y</kbd> Redo
                  </li>
                  <li>
                    <kbd>T</kbd> Translate mode
                  </li>
                  <li>
                    <kbd>R</kbd> Rotate mode
                  </li>
                  <li>
                    <kbd>D</kbd> Duplicate
                  </li>
                  <li>
                    <kbd>I</kbd> Invert rotation (all axes)
                  </li>
                  <li>
                    <kbd>X</kbd> Invert X axis
                  </li>
                  <li>
                    <kbd>Y</kbd> Invert Y axis
                  </li>
                  <li>
                    <kbd>Z</kbd> Invert Z axis
                  </li>
                  <li>
                    <kbd>Del</kbd> Delete
                  </li>
                  <li>
                    <kbd>Esc</kbd> Deselect
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Steps Editor Section */}
        <div className="accordion-section">
          <AccordionHeader section="steps" title="Steps Editor" />
          {openSections.has("steps") && (
            <div className="accordion-content">
              <StepsEditor
                steps={steps}
                availableRingIds={rings.map((r) => r.id)}
                onUpdateStep={onUpdateStep}
                onAddStep={onAddStep}
                onDeleteStep={onDeleteStep}
              />
            </div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="accordion-section">
          <AccordionHeader section="metadata" title="Metadata" />
          {openSections.has("metadata") && (
            <div className="accordion-content">
              <MetadataEditor metadata={metadata} onUpdate={onUpdateMetadata} />
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="accordion-section">
          <AccordionHeader section="settings" title="Settings" />
          {openSections.has("settings") && (
            <div className="accordion-content">
              <SettingsEditor
                version={version}
                scale={scale}
                defaultCamera={defaultCamera}
                onUpdateVersion={onUpdateVersion}
                onUpdateScale={onUpdateScale}
                onUpdateCamera={onUpdateCamera}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
