import RangeSpecForm, { INPUT_STYLES } from '@renderer/components/RangeSpecForm';
import { useAppState } from '@renderer/StateContext';
import { RangeSpec } from '@specs/index';
import { newStimSpec, SqrGratingStimsSpec, StimSpecType } from '@specs/StimsSpec';
import { useState } from 'react';
// import StimSequence from '@renderer/StimSequence';
//import { SqrGratingStimsSpec } from '@specs/StimsSpec';

export default function SpecTab() {
  //const { theStimSequence, setTheStimSequence } = useTheStimSequence();
  const { theStimsSpec, setTheStimsSpec } = useAppState();

  return (
    <div className="flex flex-col items-start p-4 bg-gray-900 -mx-4">
      <div className="mb-3 flex items-center">
        <label className="text-sm font-bold text-gray-100 px-4">SpecType:</label>
        <SpecTypeDropdown
          initialValue={theStimsSpec?.stimSpecType || StimSpecType.SqrGratings}
          onChange={(newType) => newType}
        />
      </div>

      <RangeSpecForm
        title="Cycles per degree"
        onUpdate={(cpds: RangeSpec) => {
          console.log('>>>>> cpds=' + JSON.stringify(cpds));
          setTheStimsSpec(
            newStimSpec({
              ...theStimsSpec,
              cpds: cpds,
            } as SqrGratingStimsSpec)
          );
        }}
        initialValues={(theStimsSpec as SqrGratingStimsSpec)?.cpds}
      />
      <RangeSpecForm
        title="Contrasts"
        onUpdate={(contrasts: RangeSpec) => {
          console.log('>>>>> contrasts=' + JSON.stringify(contrasts));
          setTheStimsSpec(
            newStimSpec({
              ...theStimsSpec,
              contrasts: contrasts,
            } as SqrGratingStimsSpec)
          );
        }}
        initialValues={(theStimsSpec as SqrGratingStimsSpec)?.contrasts}
      />
      <RangeSpecForm
        title="Speeds"
        onUpdate={(speeds: RangeSpec) => {
          console.log('>>>>> speeds=' + JSON.stringify(speeds));
          setTheStimsSpec(
            newStimSpec({
              ...theStimsSpec,
              speeds: speeds,
            } as SqrGratingStimsSpec)
          );
        }}
        initialValues={(theStimsSpec as SqrGratingStimsSpec)?.speeds}
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
          onChange={(e) => {
            const newValue =
              e.target.value === '' ? undefined : parseFloat(e.target.value);
            setTheStimsSpec(
              newStimSpec({
                ...theStimsSpec,
                integrityFlashIntervalMins: newValue,
              } as SqrGratingStimsSpec)
            );
          }}
          placeholder={'4'}
        />
      </div>
    </div>
  );
}

function SpecTypeDropdown(props: {
  initialValue: StimSpecType;
  onChange: (value: StimSpecType) => void;
}) {
  const [selectedValue, setSelectedValue] = useState(props.initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedValue(StimSpecType[newValue]);
    props.onChange(StimSpecType[newValue]);
  };

  return (
    <div className="inline-flex">
      <select value={selectedValue} onChange={handleChange}>
        {Object.keys(StimSpecType).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}
