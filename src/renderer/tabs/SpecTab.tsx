import RangeSpecForm, { INPUT_STYLES } from '@renderer/components/RangeSpecForm';
import { useTheStimSequence } from '@renderer/StateContext';
import RangeSpec from '@renderer/stims/RangeSpec';
import { StimsSpec } from '@renderer/stims/StimsSpec';
import StimSequence from '@renderer/StimSequence';

export default function SpecTab() {
  const { theStimSequence, setTheStimSequence } = useTheStimSequence();
  const theStimsSpec = new StimsSpec();

  function updateFromNewStimsSpec(newStimsSpec: StimsSpec) {
    setTheStimSequence(
      new StimSequence(
        theStimSequence?.loadedPath || '',
        theStimSequence?.name,
        newStimsSpec.specType + ' Spec',
        newStimsSpec.stimuli()
      )
    );
  }

  return (
    <div className="flex flex-col items-start p-4 bg-gray-900 -mx-4">
      <RangeSpecForm
        title="Cycles per degree"
        onUpdate={(cpds: RangeSpec) => {
          console.log('>>>>> cpds=' + JSON.stringify(cpds));
          theStimsSpec.cpds = cpds;
          updateFromNewStimsSpec(theStimsSpec);
        }}
        initialValues={theStimsSpec?.cpds}
      />
      <RangeSpecForm
        title="Contrasts"
        onUpdate={(contrasts: RangeSpec) => {
          console.log('>>>>> contrasts=' + JSON.stringify(contrasts));
          theStimsSpec.contrasts = contrasts;
          updateFromNewStimsSpec(theStimsSpec);
        }}
        initialValues={theStimsSpec?.contrasts}
      />
      <RangeSpecForm
        title="Speeds"
        onUpdate={(speeds: RangeSpec) => {
          console.log('>>>>> speeds=' + JSON.stringify(speeds));
          theStimsSpec.speeds = speeds;
          updateFromNewStimsSpec(theStimsSpec);
        }}
        initialValues={theStimsSpec?.speeds}
      />
      <div className="mb-1 flex items-center">
        <label className="text-sm font-bold text-gray-100 px-4">
          IntegrityFlashInterval (minutes):
        </label>
        <input
          type="number"
          className={INPUT_STYLES}
          value={
            theStimsSpec?.integrityFlashIntervalMins
              ? theStimsSpec?.integrityFlashIntervalMins
              : ''
          }
          placeholder={'4'}
        />
      </div>
    </div>
  );
}
