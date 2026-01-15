import type { RingGeometry } from '@/types/tutorial';

interface RingFormProps {
  ring: RingGeometry;
  onUpdate: (updates: Partial<RingGeometry>) => void;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function RingForm({ ring, onUpdate }: RingFormProps) {
  const handlePositionChange = (axis: 0 | 1 | 2, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const newPosition = [...ring.position] as [number, number, number];
      newPosition[axis] = num;
      onUpdate({ position: newPosition });
    }
  };

  const handleRotationChange = (axis: 0 | 1 | 2, value: string) => {
    const deg = parseFloat(value);
    if (!isNaN(deg)) {
      const newRotation = [...ring.rotation] as [number, number, number];
      newRotation[axis] = degToRad(deg);
      onUpdate({ rotation: newRotation });
    }
  };

  const handleNumberChange = (field: keyof RingGeometry, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onUpdate({ [field]: num });
    }
  };

  return (
    <div className="ring-form">
      <div className="form-section">
        <h4>Position</h4>
        <div className="input-row">
          <label>X</label>
          <input
            type="number"
            step="0.01"
            value={ring.position[0].toFixed(3)}
            onChange={e => handlePositionChange(0, e.target.value)}
          />
        </div>
        <div className="input-row">
          <label>Y</label>
          <input
            type="number"
            step="0.01"
            value={ring.position[1].toFixed(3)}
            onChange={e => handlePositionChange(1, e.target.value)}
          />
        </div>
        <div className="input-row">
          <label>Z</label>
          <input
            type="number"
            step="0.01"
            value={ring.position[2].toFixed(3)}
            onChange={e => handlePositionChange(2, e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Rotation (degrees)</h4>
        <div className="input-row">
          <label>X</label>
          <input
            type="number"
            step="1"
            value={radToDeg(ring.rotation[0]).toFixed(1)}
            onChange={e => handleRotationChange(0, e.target.value)}
          />
        </div>
        <div className="input-row">
          <label>Y</label>
          <input
            type="number"
            step="1"
            value={radToDeg(ring.rotation[1]).toFixed(1)}
            onChange={e => handleRotationChange(1, e.target.value)}
          />
        </div>
        <div className="input-row">
          <label>Z</label>
          <input
            type="number"
            step="1"
            value={radToDeg(ring.rotation[2]).toFixed(1)}
            onChange={e => handleRotationChange(2, e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Ring Properties</h4>
        <div className="input-row">
          <label>Inner Diameter</label>
          <input
            type="number"
            step="0.1"
            value={ring.innerDiameter}
            onChange={e => handleNumberChange('innerDiameter', e.target.value)}
          />
        </div>
        <div className="input-row">
          <label>Outer Diameter</label>
          <input
            type="number"
            step="0.1"
            value={ring.outerDiameter}
            onChange={e => handleNumberChange('outerDiameter', e.target.value)}
          />
        </div>
        <div className="input-row">
          <label>Wire Gauge</label>
          <input
            type="number"
            step="0.01"
            value={ring.wireGauge}
            onChange={e => handleNumberChange('wireGauge', e.target.value)}
          />
        </div>
        <div className="input-row">
          <label>Color Role</label>
          <select
            value={ring.colorRole}
            onChange={e => onUpdate({ colorRole: e.target.value })}
          >
            <option value="seed">Seed (Gold)</option>
            <option value="connector">Connector (Silver)</option>
            <option value="bronze">Bronze</option>
            <option value="steel">Steel</option>
          </select>
        </div>
        <div className="input-row checkbox">
          <label>
            <input
              type="checkbox"
              checked={ring.startsOpen ?? false}
              onChange={e => onUpdate({ startsOpen: e.target.checked })}
            />
            Starts Open (animates closed)
          </label>
        </div>
      </div>
    </div>
  );
}
