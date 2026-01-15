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
  saveTutorial: (
    tutorial: ChainmailTutorial,
    isNew: boolean,
    existingHandle?: any
  ) => Promise<any>;
  updateIndexEntry: (
    tutorialId: string,
    updates: Partial<TutorialIndexEntry>
  ) => void;
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

  const saveTutorial = async (
    tutorial: ChainmailTutorial,
    isNew: boolean,
    existingHandle?: any
  ): Promise<any> => {
    const json = JSON.stringify(tutorial, null, 2);
    const fileName = `${tutorial.metadata.id}.json`;

    // Try to use File System Access API if available (Chrome/Edge)
    // @ts-expect-error - File System Access API types not fully available
    if (window.showSaveFilePicker) {
      try {
        let fileHandle = existingHandle;

        // If we have an existing handle, use it; otherwise ask for a new one
        if (!fileHandle) {
          // @ts-expect-error - File System Access API
          fileHandle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "JSON files",
                accept: { "application/json": [".json"] },
              },
            ],
          });
        }

        const writable = await fileHandle.createWritable();
        await writable.write(json);
        await writable.close();
        return fileHandle;
      } catch (err) {
        // User cancelled or error occurred, fall through to download
        if ((err as any).name !== "AbortError") {
          console.error("Error saving file:", err);
        }
        throw err;
      }
    }

    // Fallback: Download the file
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // If it's a new tutorial, also update the index
    if (isNew) {
      updateIndexEntry(tutorial.metadata.id, {
        id: tutorial.metadata.id,
        file: fileName,
        name: tutorial.metadata.name,
        difficulty: tutorial.metadata.difficulty,
      });
    }

    return null;
  };

  const updateIndexEntry = (
    tutorialId: string,
    updates: Partial<TutorialIndexEntry>
  ): void => {
    setTutorials((prev) => {
      const existing = prev.find((t) => t.id === tutorialId);
      if (existing) {
        // Update existing entry
        return prev.map((t) =>
          t.id === tutorialId ? { ...t, ...updates } : t
        );
      } else {
        // Add new entry
        const newEntry: TutorialIndexEntry = {
          id: updates.id || tutorialId,
          file: updates.file || `${tutorialId}.json`,
          name: updates.name || tutorialId,
          difficulty: updates.difficulty || "beginner",
        };
        return [...prev, newEntry];
      }
    });
  };

  return {
    tutorials,
    isLoading,
    error,
    addTutorial,
    saveTutorial,
    updateIndexEntry,
  };
}
