import Button from '@renderer/components/Button';
import { INPUT_STYLES } from '@renderer/components/RangeSpecForm';
import { saveFileDialogAsync } from '@renderer/render-utils';
import { useAppState } from '@renderer/StateContext';
import {
  newAssay,
  AssayType,
  assaysInfo,
  SqrGratingAssay,
  ScanningDotAssay,
  FullFieldSineAssay,
} from '@src/assays/index';
import { useEffect, useState } from 'react';
import { filterPrivateAndNullProperties } from '@src/shared-utils';
import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '@renderer/render-utils';
import 'react-tooltip/dist/react-tooltip.css';
import StimSequence from '../StimSequence';
import { GratingRanges } from './GratingRanges';
import { ScanningDotRanges } from './ScanningDotRanges';
import { FullFieldSineRanges } from './FullFieldSineRanges';
import { AssayProps } from '@src/assays/Assay';

export default function AssayTab() {
  const { theAssay, setTheAssay } = useAppState();
  const { theStimsMeta, setTheStimsMeta } = useAppState();
  const { setTheStimSequence } = useAppState();

  useEffect(() => {
    // TODO?: Calculate count and duration without creating a StimSequence
    if (theAssay) {
      const stimSeq = new StimSequence(theAssay.stimuli());
      setTheStimSequence(stimSeq);
      setTheStimsMeta({
        ...theStimsMeta,
        title: theAssay?.title,
        description: theAssay?.description,
        count: stimSeq?.stimuli.length || 0,
        totalDurationMS: stimSeq?.duration(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theAssay, setTheStimsMeta]);

  if (!theAssay) {
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
            value={theAssay?.title}
            onChange={(e) => {
              setTheAssay(
                newAssay({
                  ...theAssay,
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
            value={theAssay?.description}
            onChange={(e) => {
              setTheAssay(
                newAssay({
                  ...theAssay,
                  description: e.target.value,
                })
              );
            }}
          />
        </div>
        <div className="mb-3 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            AssayType:
          </label>
          <AssayTypeDropdown
            initialValue={theAssay?.assayType || AssayType.SqrGratingPairs}
            onChange={(newType: AssayType) => {
              console.log('>>>>> AssayType changed to ' + newType);
              setTheAssay(
                newAssay({
                  ...theAssay,
                  assayType: newType,
                  description: assaysInfo[newType].description,
                })
              );
            }}
          />
        </div>
        <TwoPropsForm
          nameA="bodyMs"
          nameB="tailMs"
          toolTip="Each stimulus body is followed by a black tail (multiples of 20ms)"
        />
        <BooleanCheckbox
          label="MeanColorTail"
          propName="hasMeanColorTail"
          toolTip="Use mean of all body pixels as tail color (instead of solid black)"
        />
        <div className="border border-gray-500 rounded-md p-1">
          <SubAssayRanges />
        </div>
        <div className="mb-1 flex items-center">
          <label className="text-sm font-bold text-gray-100 px-4">
            Repetitions:
          </label>
          <input
            type="number"
            className={INPUT_STYLES}
            value={theAssay?.nRepetitions ? theAssay?.nRepetitions : 0}
            onChange={(e) => {
              const newValue =
                e.target.value === '' ? undefined : parseFloat(e.target.value);
              setTheAssay(
                newAssay({
                  ...theAssay,
                  nRepetitions: newValue,
                })
              );
            }}
            min={1}
            max={100}
            step={1}
          />
        </div>
        <BooleanCheckbox
          label="Shuffle stimuli"
          propName="doShuffle"
          toolTip="Randomize order of all stimuli (except integrity flashes and rests)"
        />
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
                theAssay?.integrityFlashIntervalMins
                  ? theAssay?.integrityFlashIntervalMins
                  : 0
              }
              onChange={(e) => {
                const newValue =
                  e.target.value === '' ? undefined : parseFloat(e.target.value);
                setTheAssay(
                  newAssay({
                    ...theAssay,
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
              (theAssay?.title.toLowerCase() || 'untitled') + '.assay.json'
            );
            setTheStimsMeta({ ...theStimsMeta, loadedPath: filePath });
            const content = JSON.stringify(
              theAssay,
              filterPrivateAndNullProperties,
              4
            );
            window.electron.send('saveFile', {
              filePath: filePath,
              content: content,
            });
          }}
        >
          Save Assay
        </Button>
      </div>
    </div>
  );
}

//-----------------------------------------------------------------------------
function AssayTypeDropdown(props: {
  initialValue: AssayType;
  onChange: (value: AssayType) => void;
}) {
  const [selectedValue, setSelectedValue] = useState(props.initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedValue(AssayType[newValue]);
    props.onChange(AssayType[newValue]);
  };

  return (
    <div className="inline-flex">
      <select value={selectedValue} onChange={handleChange}>
        {Object.keys(AssayType).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
}

//-----------------------------------------------------------------------------
function BooleanCheckbox(props: {
  label: string;
  propName: string;
  toolTip?: string;
}) {
  const { theAssay, setTheAssay } = useAppState();

  return (
    <>
      <div
        className="mb-1 flex items-center w-50"
        data-tooltip-id={props.propName + '-id'}
        data-tooltip-content={props.toolTip}
        data-tooltip-place="right"
      >
        <label className="text-sm font-bold text-gray-100 px-4">
          {props.label}:
        </label>
        <input
          type="checkbox"
          // TODO?: restyle using Tailwind’s peer utility
          className="h-4 w-4 border border-gray-500 rounded-xl text-gray-200 bg-transparent checked:bg-current"
          checked={theAssay ? theAssay[props.propName] : false}
          onChange={(e) => {
            const newValue = !!e.target.checked;
            const newStruct = newAssay({ ...theAssay });
            newStruct[props.propName] = newValue;
            setTheAssay(newStruct);
          }}
        />
      </div>
      <Tooltip id={props.propName + '-id'} className={TOOLTIP_STYLES} />
    </>
  );
}

//-----------------------------------------------------------------------------
function TwoPropsForm(props: { nameA: string; nameB: string; toolTip?: string }) {
  const { theAssay, setTheAssay } = useAppState();
  // Default values to use when field is deleted by user  or undefined
  const defaultAssayProps: AssayProps = {
    assayType: theAssay?.assayType || AssayType.SqrGratingPairs,
    title: '',
    description: '',
    bodyMs: 0,
    tailMs: 0,
    hasMeanColorTail: false,
    includeStaticGratings: false,
    nRepetitions: 1,
    integrityFlashIntervalMins: 0,
    restIntervalMins: 0,
    restDurationMins: 0,
    doShuffle: false,
  };

  if (!theAssay) {
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

    const newStruct = newAssay({ ...theAssay });
    newStruct[propName] = newValue;
    setTheAssay(newStruct);
  };

  // Ensure that if a property exists on theAssay (even if 0), it's used.
  // Only if it's strictly null or undefined will defaultAssay be used.
  const getDisplayValue = (propName: string) => {
    // Check if the property exists on theStimsSpec and is not null/undefined
    // Use `??` to allow 0 as a valid value
    const value = theAssay[propName] ?? defaultAssayProps[propName];
    // Convert undefined back to empty string for the input field to allow clearing
    return value === undefined ? '' : String(value);
  };

  return (
    <div>
      <div
        className="flex items-center bg-gray-800 rounded-xl px-2 py-1 mb-1"
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
            {(theAssay[props.nameA] ?? 0) + (theAssay[props.nameB] ?? 0)}ms
          </div>
        )}
      </div>
      <Tooltip id={props.nameA + '-id'} className={TOOLTIP_STYLES} />
    </div>
  );
}

//-----------------------------------------------------------------------------
function SubAssayRanges() {
  const { theAssay } = useAppState();

  if (
    theAssay instanceof SqrGratingAssay ||
    theAssay?.assayType === AssayType.SqrGratingPairs
  ) {
    return <GratingRanges />;
  }

  if (
    theAssay instanceof ScanningDotAssay ||
    theAssay?.assayType === AssayType.ScanningDot
  ) {
    return <ScanningDotRanges />;
  }

  if (
    theAssay instanceof FullFieldSineAssay ||
    theAssay?.assayType === AssayType.FullFieldSine
  ) {
    return <FullFieldSineRanges />;
  }

  // If no match
  return <div className="text-red-500">Unexpected theAssay.</div>;
}
