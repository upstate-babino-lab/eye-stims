import { createContext, useContext } from 'react';
import StimSequence from './StimSequence';
import { Paradigm } from '@paradigms/Paradigm';

export type StimsMeta = {
  loadedPath?: string;
  title?: string;
  description?: string;
  count?: number;
  totalDurationMS?: number;
};

type StateContextType = {
  theStimsMeta: StimsMeta | null;
  setTheStimsMeta: (value: StimsMeta) => void;
  theStimSequence: StimSequence | null;
  setTheStimSequence: (value: StimSequence) => void;
  theParadigm: Paradigm | null;
  setTheParadigm: (value: Paradigm | null) => void;
};

// Create Context with default value
export const StateContext = createContext<StateContextType | undefined>(undefined);

// Custom hook to use the shared state
export function useAppState(): StateContextType {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a StateProvider');
  }
  return context;
}
