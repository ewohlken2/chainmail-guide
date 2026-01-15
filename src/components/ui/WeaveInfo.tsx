import type { WeaveMetadata } from '@/types/tutorial';

interface WeaveInfoProps {
  metadata: WeaveMetadata;
}

export function WeaveInfo({ metadata }: WeaveInfoProps) {
  return (
    <div className="weave-info">
      <h2>{metadata.name}</h2>
      <span className={`difficulty ${metadata.difficulty}`}>
        {metadata.difficulty}
      </span>
      <p>{metadata.description}</p>
    </div>
  );
}
