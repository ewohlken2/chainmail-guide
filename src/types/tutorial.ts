export interface RingGeometry {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  innerDiameter: number;
  outerDiameter: number;
  wireGauge: number;
  colorRole: string;
}

export interface TutorialStep {
  stepNumber: number;
  title: string;
  description: string;
  ringsToAdd: string[];
  ringsToHighlight?: string[];
  tips?: string[];
}

export interface WeaveMetadata {
  id: string;
  name: string;
  alternateNames?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  history?: string;
  aspectRatio?: {
    minimum: number;
    recommended: number;
    maximum: number;
  };
  tags?: string[];
}

export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ChainmailTutorial {
  version: string;
  metadata: WeaveMetadata;
  rings: RingGeometry[];
  steps: TutorialStep[];
  defaultCamera: CameraConfig;
  scale: number;
}

export interface TutorialIndexEntry {
  id: string;
  file: string;
  name: string;
  difficulty: string;
}

export interface TutorialIndex {
  version: string;
  tutorials: TutorialIndexEntry[];
}
