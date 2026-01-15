import type { CameraConfig } from '@/types/tutorial';

interface SettingsEditorProps {
  version: string;
  scale: number;
  defaultCamera: CameraConfig;
  onUpdateVersion: (version: string) => void;
  onUpdateScale: (scale: number) => void;
  onUpdateCamera: (camera: CameraConfig) => void;
}

export function SettingsEditor({
  version,
  scale,
  defaultCamera,
  onUpdateVersion,
  onUpdateScale,
  onUpdateCamera,
}: SettingsEditorProps) {
  return (
    <div className="settings-editor">
      <div className="form-group">
        <label>Version</label>
        <input
          type="text"
          value={version}
          onChange={(e) => onUpdateVersion(e.target.value)}
          placeholder="1.0.0"
        />
      </div>

      <div className="form-group">
        <label>Scale</label>
        <input
          type="number"
          step="0.1"
          value={scale}
          onChange={(e) => onUpdateScale(parseFloat(e.target.value) || 1.0)}
        />
      </div>

      <div className="form-group">
        <label>Camera Position</label>
        <div className="form-row">
          <div className="form-col">
            <label className="form-sublabel">X</label>
            <input
              type="number"
              step="0.1"
              value={defaultCamera.position[0]}
              onChange={(e) => onUpdateCamera({
                ...defaultCamera,
                position: [
                  parseFloat(e.target.value) || 0,
                  defaultCamera.position[1],
                  defaultCamera.position[2],
                ],
              })}
            />
          </div>
          <div className="form-col">
            <label className="form-sublabel">Y</label>
            <input
              type="number"
              step="0.1"
              value={defaultCamera.position[1]}
              onChange={(e) => onUpdateCamera({
                ...defaultCamera,
                position: [
                  defaultCamera.position[0],
                  parseFloat(e.target.value) || 0,
                  defaultCamera.position[2],
                ],
              })}
            />
          </div>
          <div className="form-col">
            <label className="form-sublabel">Z</label>
            <input
              type="number"
              step="0.1"
              value={defaultCamera.position[2]}
              onChange={(e) => onUpdateCamera({
                ...defaultCamera,
                position: [
                  defaultCamera.position[0],
                  defaultCamera.position[1],
                  parseFloat(e.target.value) || 0,
                ],
              })}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Camera Target</label>
        <div className="form-row">
          <div className="form-col">
            <label className="form-sublabel">X</label>
            <input
              type="number"
              step="0.1"
              value={defaultCamera.target[0]}
              onChange={(e) => onUpdateCamera({
                ...defaultCamera,
                target: [
                  parseFloat(e.target.value) || 0,
                  defaultCamera.target[1],
                  defaultCamera.target[2],
                ],
              })}
            />
          </div>
          <div className="form-col">
            <label className="form-sublabel">Y</label>
            <input
              type="number"
              step="0.1"
              value={defaultCamera.target[1]}
              onChange={(e) => onUpdateCamera({
                ...defaultCamera,
                target: [
                  defaultCamera.target[0],
                  parseFloat(e.target.value) || 0,
                  defaultCamera.target[2],
                ],
              })}
            />
          </div>
          <div className="form-col">
            <label className="form-sublabel">Z</label>
            <input
              type="number"
              step="0.1"
              value={defaultCamera.target[2]}
              onChange={(e) => onUpdateCamera({
                ...defaultCamera,
                target: [
                  defaultCamera.target[0],
                  defaultCamera.target[1],
                  parseFloat(e.target.value) || 0,
                ],
              })}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Field of View (FOV)</label>
        <input
          type="number"
          step="1"
          value={defaultCamera.fov}
          onChange={(e) => onUpdateCamera({
            ...defaultCamera,
            fov: parseFloat(e.target.value) || 50,
          })}
        />
      </div>
    </div>
  );
}
