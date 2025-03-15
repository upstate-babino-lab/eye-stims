import StimulusPreview from './StimulusPreview';
import { useTheStimSequence } from './StateContext';

export default function SequencePreview() {
  const { theStimSequence } = useTheStimSequence();

  return (
    <div className="flex flex-col gap-2">
      <div className="h-20 bg-gray-950 border rounded-md border-gray-700">List of all sims here...</div>
      {theStimSequence && (
        <div>
          <StimulusPreview stimulus={theStimSequence.stimuli[0]} />
        </div>
      )}
    </div>
  );
}
