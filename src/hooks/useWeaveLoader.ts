import { useState, useEffect } from 'react';
import type { ChainmailTutorial } from '@/types/tutorial';

interface UseWeaveLoaderReturn {
  tutorial: ChainmailTutorial | null;
  isLoading: boolean;
  error: Error | null;
}

export function useWeaveLoader(tutorialId: string): UseWeaveLoaderReturn {
  const [tutorial, setTutorial] = useState<ChainmailTutorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTutorial() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await import(`../data/tutorials/${tutorialId}.json`);
        if (!cancelled) {
          setTutorial(response.default as ChainmailTutorial);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load tutorial'));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadTutorial();

    return () => {
      cancelled = true;
    };
  }, [tutorialId]);

  return { tutorial, isLoading, error };
}
