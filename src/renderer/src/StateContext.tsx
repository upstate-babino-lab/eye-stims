import { createContext, useContext } from 'react';
import StimSequence from './stim-sequence';

type StateContextType = {
  sharedState: StimSequence;
  setSharedState: (value: StimSequence) => void;
};

// Create Context with default value
export const StateContext = createContext<StateContextType | undefined>(undefined);

// Custom hook to use the shared state
export function useSharedState(): StateContextType {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a StateProvider');
  }
  return context;
}
