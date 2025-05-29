import React, { useEffect, useState } from 'react';
import { RangeSpec } from '@specs/index';

export const INPUT_STYLES =
  'shadow appearance-none border border-gray-500 rounded w-18 ' +
  'py-1 px-3 text-gray-300 placeholder-gray-700 leading-tight ' +
  'focus:outline-none focus:shadow-outline';

interface RangeSpecFormProps {
  title: string;
  onUpdate: (rangeSpec: RangeSpec) => void;
  initialRange: RangeSpec;
}

const RangeSpecForm: React.FC<RangeSpecFormProps> = ({
  title,
  initialRange,
  onUpdate,
}) => {
  const [start, setStart] = useState<number>(initialRange.start);
  const [step, setStep] = useState<number>(initialRange.step);
  const [nSteps, setNSteps] = useState<number>(initialRange.nSteps);
  const [list, setList] = useState<number[]>(new RangeSpec(initialRange).list);

  useEffect(() => {
    console.log(`>>>>> useEffect() start=${start} step=${step} nSteps=${nSteps}`);
    const newRangeSpec = new RangeSpec({ start, step, nSteps });
    setList(newRangeSpec.list);
    onUpdate(newRangeSpec);
  }, [start, step, nSteps]);

  useEffect(() => {
    setStart(initialRange.start);
    setStep(initialRange.step);
    setNSteps(initialRange.nSteps);
  }, [initialRange]);

  return (
    <form className="bg-gray-800 text-gray-400 text-xs font-bold shadow-md rounded-xl px-2 py-1 mb-4">
      <div className="text-gray-100 text-sm ml-2 mb-2">{title}</div>
      <div className="flex flex-row">
        <NumberInputField
          label="Start"
          value={start}
          onChange={(n) => setStart(n)}
        />
        <NumberInputField label="Step" value={step} onChange={(n) => setStep(n)} />
        <NumberInputField
          label="nSteps"
          value={nSteps}
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
  );
};

export default RangeSpecForm;

function NumberInputField(props: {
  label: string;
  value: number;
  onChange: (newNumber: number) => void;
}) {
  const { label, value, onChange } = props;
  return (
    <div className="mb-1 flex items-center space-x-3">
      <label htmlFor={label} className="w-20 text-right">
        {label}:
      </label>
      <input
        type="number"
        id={label}
        className={INPUT_STYLES + ' w-16'}
        value={value === undefined ? '' : value}
        min={label === 'nSteps' ? 1 : label === 'Start' ? 0 : undefined}
        step="any"
        onChange={(e) => {
          const newValue = +e.target.value;
          onChange(newValue);
        }}
      />
    </div>
  );
}
