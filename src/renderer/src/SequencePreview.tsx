import StimulusPreview from './StimulusPreview';
import { useTheStimSequence } from './StateContext';
import { useState } from 'react';
import Button from './components/Button';

export default function SequencePreview() {
  const { theStimSequence } = useTheStimSequence();
  const [selectedStimIndex, setSelectedStimIndex] = useState(
    theStimSequence ? 0 : -1
  );

  return (
    <div className="grow flex flex-col p-2 gap-1">
      {theStimSequence && (
        <>
          <div className="h-[100%] bg-gray-950 rounded-md   p-6 text-center text-lg">
            List of all stims here...
            <div>
              <Button onClick={() => setSelectedStimIndex(0)}>
                open first stimulus
              </Button>
            </div>
          </div>
          {selectedStimIndex >= 0 && (
            <StimulusPreview
              className="min-h-[30%] flex-shrink-0 bg-gray-950 rounded-md "
              stimulus={theStimSequence.stimuli[0]}
              onClose={() => setSelectedStimIndex(-1)}
            />
          )}
        </>
      )}
    </div>
  );
}
