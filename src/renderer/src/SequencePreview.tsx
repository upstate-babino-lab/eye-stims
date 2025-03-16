import StimulusPreview from './StimulusPreview';
import { useTheStimSequence } from './StateContext';

export default function SequencePreview() {
  const { theStimSequence } = useTheStimSequence();

  return (
    <div className="grow flex flex-col p-2 gap-1">
      <div className="h-[70%] bg-gray-950 border rounded-md border-gray-700  p-6 text-center text-lg">
        List of all stims here...
      </div>
      { theStimSequence && (
        <StimulusPreview
          className="min-h-[30%] flex-shrink-0 bg-gray-950 border rounded-md border-gray-700"
          stimulus={theStimSequence.stimuli[0]}
        />
      )}
    </div>
  );
}
