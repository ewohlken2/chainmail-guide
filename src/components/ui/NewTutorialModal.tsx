import { useState } from "react";

interface NewTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

function toDashCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function NewTutorialModal({
  isOpen,
  onClose,
  onCreate,
}: NewTutorialModalProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const dashCaseName = toDashCase(name);
  const isValid = dashCaseName.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onCreate(name);
      setName("");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>Create New Weave</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="weave-name">Weave Name</label>
              <input
                id="weave-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Byzantine 3-in-3"
                autoFocus
              />
            </div>

            {name && (
              <div className="filename-preview">
                <span className="label">File name:</span>
                <code>{dashCaseName || "..."}.json</code>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!isValid}>
              Create Weave
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
