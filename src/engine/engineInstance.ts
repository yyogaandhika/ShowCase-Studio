import { StudioEngine } from './StudioEngine';

let currentEngine: StudioEngine | null = null;

export function setEngineInstance(engine: StudioEngine | null): void {
  currentEngine = engine;
}

export function getEngineInstance(): StudioEngine | null {
  return currentEngine;
}
