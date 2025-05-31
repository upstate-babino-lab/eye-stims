import Button from '@renderer/components/Button';
import RangeSpecForm, { INPUT_STYLES } from '@renderer/components/RangeSpecForm';
import { saveFileDialogAsync } from '@renderer/render-utils';
import { useAppState } from '@renderer/StateContext';
import { RangeSpec } from '@specs/index';
import { newStimSpec, SqrGratingStimsSpec, StimSpecType } from '@specs/StimsSpec';
import { useEffect, useState } from 'react';
import { filterPrivateProperties } from '@src/shared-utils';
// import StimSequence from '@renderer/StimSequence';
//import { SqrGratingStimsSpec } from '@specs/StimsSpec';

export default function SpecTab() {
  //const { theStimSequence, setTheStimSequence } = useTheStimSequence();
  const { theStimsSpec, setTheStimsSpec } = useAppState();
  const { theStimsMeta, setTheStimsMeta } = useAppState();

  useEffect(() => {
    setTheStimsMeta({
      ...theStimsMeta,
      name: theStimsSpec?.name,
      description: theStimsSpec?.description,
      count: theStimsSpec?.count(),
      totalDurationMS: theStimsSpec?.duration(),
    });
  }, [theStimsSpec, setTheStimsMeta]);

  return (
    <div className="flex flex-row items-start p-4 bg-gray-900 -mx-4">
      <div className="flex flex-col w-130">
        <div className="mb-3 flex items-center w-full">
          <label className="text-sm font-bold text-gray-100 px-4">Name:</label>
          <input
            type="text"
            className={INPUT_STYLES + ' w-full'}
            value={theStimsSpec?.name}
            onChange={(e) => {
              setTheStimsSpec(
                newStimSpec({
                  ...theStimsSpec,
                  name: e.target.value,
                })
              );
            }}
          />
        </div>
        <div className="mb-3 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            Description:
          </label>
          <input
            type="text"
            className={INPUT_STYLES + ' w-full'}
            value={theStimsSpec?.description}
            onChange={(e) => {
              setTheStimsSpec(
                newStimSpec({
                  ...theStimsSpec,
                  description: e.target.value,
                })
              );
            }}
          />
        </div>
        <div className="mb-3 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">SpecType:</label>
          <SpecTypeDropdown
            initialValue={
              theStimsSpec?.stimSpecType || StimSpecType.SqrGratingPairs
            }
            onChange={(newType) => newType}
          />
        </div>
        <div className="flex items-center bg-gray-800 rounded-xl px-2 py-1 mb-4">
          <label className="text-sm font-bold text-gray-100 px-4">bodyMs:</label>
          <input
            type="number"
            className={INPUT_STYLES}
            value={theStimsSpec?.bodyMs ? theStimsSpec?.bodyMs : 260}
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? undefined : parseFloat(e.target.value);
              setTheStimsSpec(
                newStimSpec({
                  ...theStimsSpec,
                  bodyMs: newValue,
                })
              );
            }}
            min={20}
            step={20}
          />
          <label className="text-sm font-bold text-gray-100 px-4">tailMs:</label>
          <input
            type="number"
            className={INPUT_STYLES}
            value={theStimsSpec?.tailMs ? theStimsSpec?.tailMs : 520}
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? undefined : parseFloat(e.target.value);
              setTheStimsSpec(
                newStimSpec({
                  ...theStimsSpec,
                  tailMs: newValue,
                })
              );
            }}
            min={0}
            step={20}
          />
          <div className="px-4">
            Durations = {(theStimsSpec?.bodyMs || 0) + (theStimsSpec?.tailMs || 0)}ms
          </div>
        </div>

        <GratingRanges />

        <div className="mb-1 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            Include static gratings that don&apos;t move:
          </label>
          <input
            type="checkbox"
            // TODO: restyle using Tailwind’s peer utility
            className="h-4 w-4 border border-gray-500 rounded-xl text-gray-200 bg-transparent checked:bg-current"
            checked={theStimsSpec?.includeStaticGratings}
            onChange={(e) => {
              setTheStimsSpec(
                newStimSpec({
                  ...theStimsSpec,
                  includeStaticGratings: !!e.target.checked,
                })
              );
            }}
          />
        </div>

        <div className="mb-1 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            Repetitions:
          </label>
          <input
            type="number"
            className={INPUT_STYLES}
            value={theStimsSpec?.nRepetitions ? theStimsSpec?.nRepetitions : 0}
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? undefined : parseFloat(e.target.value);
              setTheStimsSpec(
                newStimSpec({
                  ...theStimsSpec,
                  nRepetitions: newValue,
                })
              );
            }}
            min={1}
            max={100}
            step={1}
          />
        </div>

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
                : 0
            }
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? undefined : parseFloat(e.target.value);
              setTheStimsSpec(
                newStimSpec({
                  ...theStimsSpec,
                  integrityFlashIntervalMins: newValue,
                })
              );
            }}
            min={0}
            max={100}
            step={1}
          />
        </div>
      </div>
      <Button
        className="ml-auto"
        onClick={async () => {
          const filePath = await saveFileDialogAsync(
            (theStimsSpec?.name.toLowerCase() || 'stims') + '.spec.json'
          );
          setTheStimsMeta({ ...theStimsMeta, loadedPath: filePath });
          const content = JSON.stringify(theStimsSpec, filterPrivateProperties, 4);
          window.electron.send('saveFile', {
            filePath: filePath,
            content: content,
          });
        }}
      >
        Save Spec
      </Button>
    </div>
  );
}

//-----------------------------------------------------------------------------
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

//-----------------------------------------------------------------------------
function GratingRanges() {
  const { theStimsSpec, setTheStimsSpec } = useAppState();
  const { cpds, contrasts, speeds } = theStimsSpec as SqrGratingStimsSpec;

  return (
    <div>
      <RangeSpecForm
        title="Cycles per degree"
        onUpdate={(cpds: RangeSpec) => {
          console.log('>>>>> cpds=' + JSON.stringify(cpds));
          setTheStimsSpec(
            new SqrGratingStimsSpec({
              ...theStimsSpec,
              cpds: cpds,
            })
          );
        }}
        initialRange={cpds}
      />
      <RangeSpecForm
        title="Contrasts"
        onUpdate={(contrasts: RangeSpec) => {
          console.log('>>>>> contrasts=' + JSON.stringify(contrasts));
          setTheStimsSpec(
            new SqrGratingStimsSpec({
              ...theStimsSpec,
              contrasts: contrasts,
            })
          );
        }}
        initialRange={contrasts}
      />
      <RangeSpecForm
        title="Speeds"
        onUpdate={(speeds: RangeSpec) => {
          console.log('>>>>> speeds=' + JSON.stringify(speeds));
          setTheStimsSpec(
            new SqrGratingStimsSpec({
              ...theStimsSpec,
              speeds: speeds,
            })
          );
        }}
        initialRange={speeds}
      />
    </div>
  );
}
