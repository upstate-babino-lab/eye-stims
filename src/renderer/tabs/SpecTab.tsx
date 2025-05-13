import RangeSpecForm, { INPUT_STYLES } from '@renderer/components/RangeSpecForm';
import { useTheStimSequence } from '@renderer/StateContext';
import { RangeSpec } from '@renderer/stims/StimsSpec';

export default function SpecTab() {
  const { theStimSequence } = useTheStimSequence();

  const theStimSpec = theStimSequence?.spec;
  return (
    <div className="flex flex-col items-start p-3">
      <RangeSpecForm
        title="Cycles per degree"
        onSubmit={(rangeSpec: RangeSpec) => {
          console.log('>>>>> ' + JSON.stringify(rangeSpec));
        }}
        initialValues={theStimSpec?.cpd}
      />
      <RangeSpecForm
        title="Contrasts"
        onSubmit={(rangeSpec: RangeSpec) => {
          console.log('>>>>> ' + JSON.stringify(rangeSpec));
        }}
        initialValues={theStimSpec?.contrast}
      />
      <RangeSpecForm
        title="Speeds"
        onSubmit={(rangeSpec: RangeSpec) => {
          console.log('>>>>> ' + JSON.stringify(rangeSpec));
        }}
        initialValues={theStimSpec?.speed}
      />
      <div className="mb-1 flex items-center">
        <label className="text-sm font-bold text-gray-100 px-4">
          IntegrityFlashInterval (minutes):
        </label>
        <input
          type="number"
          className={INPUT_STYLES}
          value={
            theStimSpec?.integrityFlashIntervalMins
              ? theStimSpec?.integrityFlashIntervalMins
              : ''
          }
          placeholder={'4'}
        />
      </div>
      <div className="mb-1 flex items-center">
        <label className="text-sm font-bold text-gray-100 px-4">
          Repetitions:
        </label>
        <input
          type="number"
          className={INPUT_STYLES}
          value={
            theStimSpec?.integrityFlashIntervalMins
              ? theStimSpec?.integrityFlashIntervalMins
              : ''
          }
          placeholder={'1'}
        />
      </div>
    </div>
  );
}
