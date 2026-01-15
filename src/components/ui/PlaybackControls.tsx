interface PlaybackControlsProps {
  isPlaying: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
}

export function PlaybackControls({
  isPlaying,
  canGoNext,
  canGoPrev,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
}: PlaybackControlsProps) {
  return (
    <div className="playback-controls">
      <button
        onClick={onReset}
        title="Reset (Home)"
        aria-label="Reset to beginning"
      >
        ⏮
      </button>

      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        title="Previous step (←)"
        aria-label="Previous step"
      >
        ⏪
      </button>

      <button
        className="primary"
        onClick={isPlaying ? onPause : onPlay}
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        title="Next step (→)"
        aria-label="Next step"
      >
        ⏩
      </button>
    </div>
  );
}
