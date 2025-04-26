import StimulusPreview from './StimulusPreview';
import { useTheStimSequence } from './StateContext';
import { useState } from 'react';
import StimList from './StimList';

export default function SequencePreviewTab() {
  const { theStimSequence } = useTheStimSequence();
  const [selectedStimIndex, setSelectedStimIndex] = useState(-1);
  return (
    <div className="grow flex flex-col p-2 gap-2">
      {theStimSequence && (
        <>
          <div className="h-[100%] bg-gray-950 rounded-md p-2 text-center text-lg">
            <StimList
              data={theStimSequence.stimuli}
              onRowClick={(index) => {
                console.log(`>>>>> onRowClick(${index})`);
                setSelectedStimIndex(index);
              }}
            />
          </div>
          {selectedStimIndex >= 0 && (
            <StimulusPreview
              className="min-h-[30%] flex-shrink-0 bg-gray-950 rounded-md border-0 border-gray-800"
              stimIndex={selectedStimIndex}
              onClose={() => setSelectedStimIndex(-1)}
            />
          )}
        </>
      )}
    </div>
  );
}
