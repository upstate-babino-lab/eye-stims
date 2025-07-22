import Button from '@renderer/components/Button';
import { INPUT_STYLES } from '@renderer/components/RangeSpecForm';
import { saveFileDialogAsync } from '@renderer/render-utils';
import { useAppState } from '@renderer/StateContext';
import {
  newParadigm,
  ParadigmType,
  paradigmsInfo,
  SqrGratingParadigm,
  ScanningDotParadigm,
  FullFieldSineParadigm,
} from '@src/paradigms/index';
import { useEffect, useState } from 'react';
import { filterPrivateProperties } from '@src/shared-utils';
import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '@renderer/render-utils';
import 'react-tooltip/dist/react-tooltip.css';
import StimSequence from '../StimSequence';
import { GratingRanges } from './GratingRanges';
import { ScanningDotRanges } from './ScanningDotRanges';
import { FullFieldSineRanges } from './FullFieldSineRanges';

export default function ParadigmTab() {
  const { theParadigm, setTheParadigm } = useAppState();
  const { theStimsMeta, setTheStimsMeta } = useAppState();
  const { setTheStimSequence } = useAppState();

  useEffect(() => {
    // TODO?: Calculate count and duration without creating a StimSequence
    if (theParadigm) {
      const stimSeq = new StimSequence(theParadigm.stimuli());
      setTheStimSequence(stimSeq);
      setTheStimsMeta({
        ...theStimsMeta,
        title: theParadigm?.title,
        description: theParadigm?.description,
        count: stimSeq?.stimuli.length || 0,
        totalDurationMS: stimSeq?.duration(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theParadigm, setTheStimsMeta]);

  if (!theParadigm) {
    return <div></div>;
  }

  return (
    <div className="flex flex-row items-start p-4 bg-gray-900 -mx-4">
      <div className="flex flex-col w-130 gap-0.5">
        <div className="mb-3 flex items-center w-full">
          <label className="text-sm font-bold text-gray-100 px-4">Title:</label>
          <input
            type="text"
            className={INPUT_STYLES + ' w-full'}
            value={theParadigm?.title}
            onChange={(e) => {
              setTheParadigm(
                newParadigm({
                  ...theParadigm,
                  title: e.target.value,
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
            value={theParadigm?.description}
            onChange={(e) => {
              setTheParadigm(
                newParadigm({
                  ...theParadigm,
                  description: e.target.value,
                })
              );
            }}
          />
        </div>
        <div className="mb-3 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            ParadigmType:
          </label>
          <ParadigmTypeDropdown
            initialValue={
              theParadigm?.paradigmType || ParadigmType.SqrGratingPairs
            }
            onChange={(newType: ParadigmType) => {
              console.log('>>>>> ParadigmType changed to ' + newType);
              setTheParadigm(
                newParadigm({
                  ...theParadigm,
                  paradigmType: newType,
                  description: paradigmsInfo[newType].description,
                })
              );
            }}
          />
        </div>
        <TwoPropsForm
          nameA="bodyMs"
          nameB="tailMs"
          toolTip="Each stimulus body is followed by a black tail"
        />
        <TwoPropsForm
          nameA="grayMs"
          nameB="grayTailMs"
          toolTip="If grayMs > 0, each stim is followed by a gray flash and its black tail"
        />

        <SubParadigmRanges />

        <div className="mb-1 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            Repetitions:
          </label>
          <input
            type="number"
            className={INPUT_STYLES}
            value={theParadigm?.nRepetitions ? theParadigm?.nRepetitions : 0}
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? undefined : parseFloat(e.target.value);
              setTheParadigm(
                newParadigm({
                  ...theParadigm,
                  nRepetitions: newValue,
                })
              );
            }}
            min={1}
            max={100}
            step={1}
          />
        </div>
        <>
          <div
            className="mb-1 flex items-center w-50"
            data-tooltip-id={'do-shuffle-id'}
            data-tooltip-content={
              'Randomize order of all stimuli (except integrity flashes and rests)'
            }
            data-tooltip-place="right"
          >
            <label className="text-sm font-bold text-gray-100 px-4">
              Shuffle stimuli:
            </label>
            <input
              type="checkbox"
              // TODO?: restyle using Tailwind’s peer utility
              className="h-4 w-4 border border-gray-500 rounded-xl text-gray-200 bg-transparent checked:bg-current"
              checked={theParadigm.doShuffle}
              onChange={(e) => {
                setTheParadigm(
                  newParadigm({
                    ...theParadigm,
                    doShuffle: !!e.target.checked,
                  })
                );
              }}
            />
          </div>
          <Tooltip id={'do-shuffle-id'} className={TOOLTIP_STYLES} />
        </>
        <>
          <div
            className="mb-1 flex items-center w-90"
            data-tooltip-id={'integrity-flash-id'}
            data-tooltip-content={
              'gray, red, green, blue flashes optional at interval, required at start and end'
            }
            data-tooltip-place="right"
          >
            <label className="text-sm font-bold text-gray-100 px-4">
              Integrity flashes interval (mins):
            </label>
            <input
              type="number"
              className={INPUT_STYLES}
              value={
                theParadigm?.integrityFlashIntervalMins
                  ? theParadigm?.integrityFlashIntervalMins
                  : 0
              }
              onChange={(e) => {
                const newValue =
                  e.target.value === '' ? undefined : parseFloat(e.target.value);
                setTheParadigm(
                  newParadigm({
                    ...theParadigm,
                    integrityFlashIntervalMins: newValue,
                  })
                );
              }}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <Tooltip id={'integrity-flash-id'} className={TOOLTIP_STYLES} />
        </>
        <TwoPropsForm
          nameA="restIntervalMins"
          nameB="restDurationMins"
          toolTip="How often and how long to rest with solid black"
        />
      </div>

      <div className="flex flex-col gap-2 ml-auto">
        <Button
          className="ml-auto"
          onClick={async () => {
            const filePath = await saveFileDialogAsync(
              (theParadigm?.title.toLowerCase() || 'untitled') + '.paradigm.json'
            );
            setTheStimsMeta({ ...theStimsMeta, loadedPath: filePath });
            const content = JSON.stringify(
              theParadigm,
              filterPrivateProperties,
              4
            );
            window.electron.send('saveFile', {
              filePath: filePath,
              content: content,
            });
          }}
        >
          Save Paradigm
        </Button>
      </div>
    </div>
  );
}

//-----------------------------------------------------------------------------
function ParadigmTypeDropdown(props: {
  initialValue: ParadigmType;
  onChange: (value: ParadigmType) => void;
}) {
  const [selectedValue, setSelectedValue] = useState(props.initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedValue(ParadigmType[newValue]);
    props.onChange(ParadigmType[newValue]);
  };

  return (
    <div className="inline-flex">
      <select value={selectedValue} onChange={handleChange}>
        {Object.keys(ParadigmType).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}

//-----------------------------------------------------------------------------
function TwoPropsForm(props: { nameA: string; nameB: string; toolTip?: string }) {
  const { theParadigm: theStimsSpec, setTheParadigm: setTheStimsSpec } =
    useAppState();
  const defaultParadigm = newParadigm({
    paradigmType: theStimsSpec?.paradigmType || ParadigmType.SqrGratingPairs,
  });

  if (!theStimsSpec) {
    return <div className="text-red-500">No StimsSpec available</div>;
  }

  // Helper function to handle input changes and update state
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    propName: string
  ) => {
    // Keep 'undefined' for empty string to allow clearing the input field
    // However, if 0 is a valid input, parseFloat will convert '0' to 0
    const newValue =
      e.target.value === '' ? undefined : parseFloat(e.target.value);

    const newSpec = newParadigm({ ...theStimsSpec });
    newSpec[propName] = newValue;
    setTheStimsSpec(newSpec);
  };

  // Helper to safely get the value for display
  // This function ensures that if a property exists on theStimsSpec (even if 0),
  // it's used. Only if it's strictly null or undefined will defaultParadigm be used.
  const getDisplayValue = (propName: string) => {
    // Check if the property exists on theStimsSpec and is not null/undefined
    // Use `??` to allow 0 as a valid value
    const value = theStimsSpec[propName] ?? defaultParadigm[propName];
    // Convert undefined back to empty string for the input field to allow clearing
    return value === undefined ? '' : String(value);
  };

  return (
    <div>
      <div
        className="flex items-center bg-gray-800 rounded-xl px-2 py-1 mb-4"
        data-tooltip-id={props.nameA + '-id'}
        data-tooltip-content={props.toolTip}
        data-tooltip-place="right"
      >
        <label className="text-sm font-bold text-gray-100 px-4">
          {props.nameA}:
        </label>
        <input
          type="number"
          className={INPUT_STYLES}
          // Use the helper function for display value
          value={getDisplayValue(props.nameA)}
          onChange={(e) => handleInputChange(e, props.nameA)}
          min={0}
          step={props.nameA.endsWith('Ms') ? 20 : 1}
        />
        <label className="text-sm font-bold text-gray-100 px-4">
          {props.nameB}:
        </label>
        <input
          type="number"
          className={INPUT_STYLES}
          // Use the helper function for display value
          value={getDisplayValue(props.nameB)}
          onChange={(e) => handleInputChange(e, props.nameB)}
          min={0} // Make sure this is 0 if you want 0 input to be valid
          step={props.nameA.endsWith('Ms') ? 20 : 1}
        />
        {props.nameA.endsWith('Ms') && props.nameB.endsWith('Ms') && (
          <div className="px-4">
            Durations ={' '}
            {(theStimsSpec[props.nameA] ?? 0) + (theStimsSpec[props.nameB] ?? 0)}ms
          </div>
        )}
      </div>
      <Tooltip id={props.nameA + '-id'} className={TOOLTIP_STYLES} />
    </div>
  );
}

//-----------------------------------------------------------------------------
function SubParadigmRanges() {
  const { theParadigm } = useAppState();

  if (
    theParadigm instanceof SqrGratingParadigm ||
    theParadigm?.paradigmType === ParadigmType.SqrGratingPairs
  ) {
    return <GratingRanges />;
  }

  if (
    theParadigm instanceof ScanningDotParadigm ||
    theParadigm?.paradigmType === ParadigmType.ScanningDot
  ) {
    return <ScanningDotRanges />;
  }

  if (
    theParadigm instanceof FullFieldSineParadigm ||
    theParadigm?.paradigmType === ParadigmType.FullFieldSine
  ) {
    return <FullFieldSineRanges />;
  }

  // If no match
  return <div className="text-red-500">Unexpected theParadigm.</div>;
}
