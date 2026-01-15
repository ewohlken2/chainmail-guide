import type { TutorialStep } from '@/types/tutorial';

interface StepsEditorProps {
  steps: TutorialStep[];
  availableRingIds: string[];
  onUpdateStep: (stepNumber: number, updates: Partial<TutorialStep>) => void;
  onAddStep: () => void;
  onDeleteStep: (stepNumber: number) => void;
}

export function StepsEditor({
  steps,
  availableRingIds,
  onUpdateStep,
  onAddStep,
  onDeleteStep,
}: StepsEditorProps) {
  return (
    <div className="steps-editor">
      <div className="editor-section-header">
        <h3>Steps ({steps.length})</h3>
        <button className="btn-small primary" onClick={onAddStep}>
          + Add Step
        </button>
      </div>

      <div className="steps-list">
        {steps.map((step) => (
          <div key={step.stepNumber} className="step-editor-item">
            <div className="step-header">
              <span className="step-number">Step {step.stepNumber}</span>
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

            <div className="form-group">
              <label>Rings to Add (comma-separated IDs)</label>
              <input
                type="text"
                value={step.ringsToAdd.join(', ')}
                onChange={(e) => {
                  const ringIds = e.target.value
                    .split(',')
                    .map(id => id.trim())
                    .filter(id => id.length > 0);
                  onUpdateStep(step.stepNumber, { ringsToAdd: ringIds });
                }}
                placeholder="ring-1, ring-2"
              />
              <div className="form-hint">
                Available rings: {availableRingIds.join(', ') || 'none'}
              </div>
            </div>

            <div className="form-group">
              <label>Rings to Highlight (comma-separated IDs, optional)</label>
              <input
                type="text"
                value={step.ringsToHighlight?.join(', ') || ''}
                onChange={(e) => {
                  const ringIds = e.target.value
                    .split(',')
                    .map(id => id.trim())
                    .filter(id => id.length > 0);
                  onUpdateStep(step.stepNumber, { 
                    ringsToHighlight: ringIds.length > 0 ? ringIds : undefined 
                  });
                }}
                placeholder="ring-1, ring-2"
              />
            </div>

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
        ))}
      </div>
    </div>
  );
}
