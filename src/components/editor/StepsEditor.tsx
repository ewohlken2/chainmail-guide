import { useState, useRef, useEffect, useMemo } from 'react';
import type { TutorialStep } from '@/types/tutorial';

interface StepsEditorProps {
  steps: TutorialStep[];
  availableRingIds: string[];
  onUpdateStep: (stepNumber: number, updates: Partial<TutorialStep>) => void;
  onAddStep: () => void;
  onDeleteStep: (stepNumber: number) => void;
}

interface MultiSelectProps {
  label: string;
  selectedIds: string[];
  availableIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  hint?: string;
}

function MultiSelect({
  label,
  selectedIds,
  availableIds,
  onChange,
  placeholder = 'Select rings...',
  hint,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (ringId: string) => {
    const newSelected = selectedIds.includes(ringId)
      ? selectedIds.filter((id) => id !== ringId)
      : [...selectedIds, ringId];
    onChange(newSelected);
  };

  const displayText =
    selectedIds.length === 0
      ? placeholder
      : selectedIds.length === 1
      ? selectedIds[0]
      : `${selectedIds.length} rings selected`;

  return (
    <div className="form-group" ref={containerRef}>
      <label>{label}</label>
      <div className="multi-select-container">
        <button
          type="button"
          className="multi-select-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedIds.length === 0 ? 'placeholder' : ''}>
            {displayText}
          </span>
          <span className="multi-select-arrow">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="multi-select-dropdown">
            {availableIds.length === 0 ? (
              <div className="multi-select-empty">No rings available</div>
            ) : (
              availableIds.map((ringId) => (
                <label key={ringId} className="multi-select-option">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(ringId)}
                    onChange={() => handleToggle(ringId)}
                  />
                  <span>{ringId}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}

export function StepsEditor({
  steps,
  availableRingIds,
  onUpdateStep,
  onAddStep,
  onDeleteStep,
}: StepsEditorProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    new Set(steps.map((s) => s.stepNumber))
  );

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const stepNumbers = useMemo(
    () => steps.map((s) => s.stepNumber).sort((a, b) => a - b),
    [steps]
  );
  const prevStepNumbersRef = useRef<number[]>([]);

  // Auto-expand newly added steps and clean up deleted steps
  useEffect(() => {
    const prevStepNumbers = prevStepNumbersRef.current;
    const currentStepNumbers = new Set(stepNumbers);
    const prevStepNumbersSet = new Set(prevStepNumbers);

    // Find new steps
    const newStepNumbers = stepNumbers.filter((num) => !prevStepNumbersSet.has(num));

    if (newStepNumbers.length > 0 || prevStepNumbers.length === 0) {
      setExpandedSteps((prev) => {
        const next = new Set<number>();
        // Keep existing expanded steps that still exist
        prev.forEach((stepNum) => {
          if (currentStepNumbers.has(stepNum)) {
            next.add(stepNum);
          }
        });
        // Add new steps (auto-expand them)
        newStepNumbers.forEach((stepNum) => next.add(stepNum));
        // If this is the initial load, expand all
        if (prevStepNumbers.length === 0) {
          stepNumbers.forEach((stepNum) => next.add(stepNum));
        }
        return next;
      });
    }

    prevStepNumbersRef.current = stepNumbers;
  }, [stepNumbers]);

  return (
    <div className="steps-editor">
      <div className="editor-section-header">
        <h3>Steps ({steps.length})</h3>
        <button className="btn-small primary" onClick={onAddStep}>
          + Add Step
        </button>
      </div>

      <div className="steps-list">
        {steps.map((step) => {
          const isExpanded = expandedSteps.has(step.stepNumber);
          return (
            <div key={step.stepNumber} className="step-editor-item">
              <div
                className="step-header"
                onClick={() => toggleStep(step.stepNumber)}
              >
                <div className="step-header-content">
                  <span className="step-accordion-icon">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span className="step-number">Step {step.stepNumber}</span>
                  {step.title && (
                    <span className="step-title-preview">: {step.title}</span>
                  )}
                </div>
                <div className="step-header-actions" onClick={(e) => e.stopPropagation()}>
                  {steps.length > 1 && (
                    <button
                      className="btn-small danger"
                      onClick={() => onDeleteStep(step.stepNumber)}
                      title="Delete step"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="step-content">

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={step.title}
                onChange={(e) => onUpdateStep(step.stepNumber, { title: e.target.value })}
                placeholder="Step title"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={step.description}
                onChange={(e) => onUpdateStep(step.stepNumber, { description: e.target.value })}
                placeholder="Step description"
                rows={3}
              />
            </div>

            <MultiSelect
              label="Rings to Add"
              selectedIds={step.ringsToAdd}
              availableIds={availableRingIds}
              onChange={(ringIds) => {
                onUpdateStep(step.stepNumber, { ringsToAdd: ringIds });
              }}
              placeholder="Select rings to add in this step..."
              hint={`Available rings: ${availableRingIds.join(', ') || 'none'}`}
            />

            <MultiSelect
              label="Rings to Highlight (optional)"
              selectedIds={step.ringsToHighlight || []}
              availableIds={availableRingIds}
              onChange={(ringIds) => {
                onUpdateStep(step.stepNumber, {
                  ringsToHighlight: ringIds.length > 0 ? ringIds : undefined,
                });
              }}
              placeholder="Select rings to highlight in this step..."
            />

                  <div className="form-group">
                    <label>Tips (one per line)</label>
                    <textarea
                      value={step.tips?.join('\n') || ''}
                      onChange={(e) => {
                        const tips = e.target.value
                          .split('\n')
                          .map(tip => tip.trim())
                          .filter(tip => tip.length > 0);
                        onUpdateStep(step.stepNumber, { 
                          tips: tips.length > 0 ? tips : undefined 
                        });
                      }}
                      placeholder="Tip 1&#10;Tip 2"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
