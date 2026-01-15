import { useState, useEffect } from "react";
import type {
  TutorialIndex,
  TutorialIndexEntry,
  ChainmailTutorial,
} from "@/types/tutorial";

interface UseTutorialIndexReturn {
  tutorials: TutorialIndexEntry[];
  isLoading: boolean;
  error: Error | null;
  addTutorial: (name: string) => ChainmailTutorial;
}

function toDashCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createNewTutorial(name: string): ChainmailTutorial {
  const id = toDashCase(name);

  return {
    version: "1.0.0",
    metadata: {
      id,
      name,
      difficulty: "beginner",
      description: `A custom chainmail weave: ${name}`,
      tags: ["custom"],
    },
    defaultCamera: {
      position: [0, 3, 6],
      target: [0, 0, 0],
      fov: 50,
    },
    scale: 1.0,
    rings: [
      {
        id: "ring-1",
        position: [0, 0, 0],
        rotation: [1.5708, 0, 0.7854],
        innerDiameter: 0.6,
        outerDiameter: 0.8,
        wireGauge: 0.1,
        colorRole: "seed",
        startsOpen: false,
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Start with the Seed Ring",
        description:
          "Begin with a single closed ring. This will be the foundation of your weave.",
        ringsToAdd: ["ring-1"],
        tips: ["This is the starting ring of your custom weave"],
      },
    ],
  };
}

export function useTutorialIndex(): UseTutorialIndexReturn {
  const [tutorials, setTutorials] = useState<TutorialIndexEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadIndex() {
      try {
        const response = await import("../data/tutorials/index.json");
        const index = response.default as TutorialIndex;
        setTutorials(index.tutorials);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load tutorial index")
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadIndex();
  }, []);

  const addTutorial = (name: string): ChainmailTutorial => {
    const newTutorial = createNewTutorial(name);
    const id = toDashCase(name);

    // Add to local state
    setTutorials((prev) => [
      ...prev,
      {
        id,
        file: `${id}.json`,
        name,
        difficulty: "beginner",
      },
    ]);

    return newTutorial;
  };

  return { tutorials, isLoading, error, addTutorial };
}
