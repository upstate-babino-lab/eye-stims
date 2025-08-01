import React, { useEffect, useState } from 'react';
import { RangeSpec } from '@src/paradigms/index';
import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '../render-utils';
import 'react-tooltip/dist/react-tooltip.css';
import { confine } from '@src/paradigms/RangeSpec';

export const INPUT_STYLES =
  'shadow appearance-none border border-gray-500 rounded w-19 ' +
  'py-1 px-3 text-gray-300 placeholder-gray-700 leading-tight ' +
  'focus:outline-none focus:shadow-outline';

interface RangeSpecFormProps {
  title: string;
  toolTip?: string;
  initialRange: RangeSpec;
  onUpdate: (rangeSpec: RangeSpec) => void;
  min?: number;
  max?: number;
}

const RangeSpecForm: React.FC<RangeSpecFormProps> = ({
  title,
  toolTip,
  initialRange,
  onUpdate,
  min,
  max,
}) => {
  const [start, setStart] = useState<number | undefined>(initialRange.start);
  const [step, setStep] = useState<number | undefined>(initialRange.step);
  const [nSteps, setNSteps] = useState<number | undefined>(initialRange.nSteps);
  const [list, setList] = useState<number[]>([]); // Initialize list as empty or based on initialRange for immediate calc

  useEffect(() => {
    // console.log(`>>>>> useEffect() start=${start} step=${step} nSteps=${nSteps}`);
    // Provide default values if start, step, nSteps are undefined for RangeSpec constructor
    const newRangeSpec = new RangeSpec({
      start: start ?? 0, // Default start to 0 if undefined
      step: step, // ?? 1, // Default step to 1 if undefined (common for steps)
      nSteps: nSteps, // ?? 1, // Default nSteps to 1 if undefined (min is 1 for nSteps input anyway)
      min: min,
      max: max,
    });
    setList(newRangeSpec.list);
    onUpdate(newRangeSpec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, step, nSteps, min, max]);

  useEffect(() => {
    setStart(initialRange.start);
    setStep(initialRange.step);
    setNSteps(initialRange.nSteps);
  }, [initialRange]);

  return (
    <div>
      <form
        className="text-gray-400 text-xs font-bold shadow-md bg-gray-800 rounded-xl px-2 py-0.5"
        data-tooltip-id={title + '-id'} // Unique ID for the tooltip
        data-tooltip-content={toolTip}
        data-tooltip-place="right" // Position (top, right, bottom, left)
      >
        <div className="text-gray-100 text-sm ml-2 mb-2">{title}</div>
        <div className="flex flex-row">
          <NumberInputField
            label="Start"
            value={start} // Can be number | undefined
            onChange={(n) => setStart(confine(n, min, max))}
          />
          <NumberInputField
            label="Step"
            value={step} // Can be number | undefined
            onChange={(n) => setStep(n)}
          />
          <NumberInputField
            label="nSteps"
            value={nSteps} // Can be number | undefined
            onChange={(n) => setNSteps(n)}
          />
        </div>
        <div className="mb-2 flex items-center space-x-2">
          <label className="w-20 text-right">List:</label>
          <span className="text-gray-200 font-normal">
            {JSON.stringify(
              list.map((e) => Math.round(e * 1000) / 1000), // For more compact formatting
              null,
              1
            )}
          </span>
        </div>
      </form>
      <Tooltip id={title + '-id'} className={TOOLTIP_STYLES} />
    </div>
  );
};

export default RangeSpecForm;

//-----------------------------------------------------------------------------
function NumberInputField(props: {
  label: string;
  value: number | undefined;
  onChange: (newNumber: number | undefined) => void;
}) {
  const { label, value, onChange } = props;

  // Determine the 'min' attribute based on the label
  // If no minimum constraint, leave it undefined.
  let minAttr: number | undefined;
  if (label === 'nSteps') {
    minAttr = 1; // nSteps must be at least 1
  }
  // For 'Start' and 'Step', we allow negative numbers and zero by leaving minAttr undefined

  return (
    <div className="mb-1 flex items-center space-x-3">
      <label htmlFor={label} className="w-19 text-right">
        {label}:
      </label>
      <input
        type="number"
        id={label}
        className={INPUT_STYLES + ' w-16'}
        // This is correct: render '' when value is undefined
        value={value === undefined ? '' : value}
        // Set 'min' only if it's 'nSteps', otherwise it's undefined
        min={minAttr}
        step="any" // Allows decimal numbers
        onChange={(e) => {
          const rawValue = e.target.value;
          // Convert empty string to undefined, otherwise convert to number
          const newValue = rawValue === '' ? undefined : +rawValue;

          // Pass the new value to the parent's onChange handler
          onChange(newValue);
        }}
      />
    </div>
  );
}
