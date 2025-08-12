import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '../render-utils';
import { INPUT_STYLES } from '../components/RangeSpecForm';
import { newAssay } from '@src/assays';
import { useAppState } from '../StateContext';
import { AssayProps, AssayType } from '@src/assays/Assay';

export function AssayTwoPropsForm(props: {
  nameA: string;
  nameB: string;
  toolTip?: string;
}) {
  const { theAssay, setTheAssay } = useAppState();
  // Default values to use when field is deleted by user  or undefined
  const defaultAssayProps: AssayProps = {
    assayType: theAssay?.assayType || AssayType.SqrGratingPairs,
    title: '',
    description: '',
    bodyMs: 0,
    tailMs: 0,
    colorTails: false,
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
        className="flex items-center bg-gray-800 rounded-lg px-2 py-1 mb-1"
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
