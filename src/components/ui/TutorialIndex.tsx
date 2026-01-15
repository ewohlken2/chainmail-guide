import type { TutorialIndexEntry } from "@/types/tutorial";

interface TutorialIndexProps {
  tutorials: TutorialIndexEntry[];
  onSelectTutorial: (id: string) => void;
  onCreateNew: () => void;
}

export function TutorialIndex({
  tutorials,
  onSelectTutorial,
  onCreateNew,
}: TutorialIndexProps) {
  return (
    <div className="tutorial-index">
      <div className="index-header">
        <h2>Chainmail Weave Tutorials</h2>
        <p>Select a weave pattern to learn, or create your own.</p>
      </div>

      <div className="tutorial-grid">
        {tutorials.map((tutorial) => (
          <button
            key={tutorial.id}
            className="tutorial-card"
            onClick={() => onSelectTutorial(tutorial.id)}
          >
            <div className="card-icon">⛓️</div>
            <h3>{tutorial.name}</h3>
            <span className={`difficulty ${tutorial.difficulty}`}>
              {tutorial.difficulty}
            </span>
          </button>
        ))}

        <button className="tutorial-card new-card" onClick={onCreateNew}>
          <div className="card-icon">+</div>
          <h3>Create New</h3>
          <span className="difficulty custom">custom weave</span>
        </button>
      </div>
    </div>
  );
}
