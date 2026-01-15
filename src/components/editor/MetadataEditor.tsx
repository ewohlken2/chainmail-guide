import type { WeaveMetadata } from "@/types/tutorial";

interface MetadataEditorProps {
  metadata: WeaveMetadata;
  onUpdate: (updates: Partial<WeaveMetadata>) => void;
}

export function MetadataEditor({ metadata, onUpdate }: MetadataEditorProps) {
  return (
    <div className="metadata-editor">
      <div className="form-group">
        <label>ID</label>
        <input
          type="text"
          value={metadata.id}
          onChange={(e) => onUpdate({ id: e.target.value })}
          placeholder="weave-id"
        />
      </div>

      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={metadata.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Weave Name"
        />
      </div>

      <div className="form-group">
        <label>Alternate Names (comma-separated)</label>
        <input
          type="text"
          value={metadata.alternateNames?.join(", ") || ""}
          onChange={(e) => {
            const names = e.target.value
              .split(",")
              .map((name) => name.trim())
              .filter((name) => name.length > 0);
            onUpdate({ alternateNames: names.length > 0 ? names : undefined });
          }}
          placeholder="Alt Name 1, Alt Name 2"
        />
      </div>

      <div className="form-group">
        <label>Difficulty</label>
        <select
          value={metadata.difficulty}
          onChange={(e) =>
            onUpdate({
              difficulty: e.target.value as WeaveMetadata["difficulty"],
            })
          }
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={metadata.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Weave description"
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>History (optional)</label>
        <textarea
          value={metadata.history || ""}
          onChange={(e) => onUpdate({ history: e.target.value || undefined })}
          placeholder="Historical context"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Aspect Ratio</label>
        <div className="form-row">
          <div className="form-col">
            <label className="form-sublabel">Minimum</label>
            <input
              type="number"
              step="0.1"
              value={metadata.aspectRatio?.minimum || ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : 0;
                const current = metadata.aspectRatio || {
                  minimum: 0,
                  recommended: 0,
                  maximum: 0,
                };
                onUpdate({
                  aspectRatio: {
                    minimum: val,
                    recommended: current.recommended || 0,
                    maximum: current.maximum || 0,
                  },
                });
              }}
              placeholder="3.0"
            />
          </div>
          <div className="form-col">
            <label className="form-sublabel">Recommended</label>
            <input
              type="number"
              step="0.1"
              value={metadata.aspectRatio?.recommended || ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : 0;
                const current = metadata.aspectRatio || {
                  minimum: 0,
                  recommended: 0,
                  maximum: 0,
                };
                onUpdate({
                  aspectRatio: {
                    minimum: current.minimum || 0,
                    recommended: val,
                    maximum: current.maximum || 0,
                  },
                });
              }}
              placeholder="4.0"
            />
          </div>
          <div className="form-col">
            <label className="form-sublabel">Maximum</label>
            <input
              type="number"
              step="0.1"
              value={metadata.aspectRatio?.maximum || ""}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : 0;
                const current = metadata.aspectRatio || {
                  minimum: 0,
                  recommended: 0,
                  maximum: 0,
                };
                onUpdate({
                  aspectRatio: {
                    minimum: current.minimum || 0,
                    recommended: current.recommended || 0,
                    maximum: val,
                  },
                });
              }}
              placeholder="5.5"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          value={metadata.tags?.join(", ") || ""}
          onChange={(e) => {
            const tags = e.target.value
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0);
            onUpdate({ tags: tags.length > 0 ? tags : undefined });
          }}
          placeholder="armor, beginner, classic"
        />
      </div>
    </div>
  );
}
