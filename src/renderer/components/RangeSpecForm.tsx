import React, { useEffect, useState } from 'react';
import { RangeSpec } from '@specs/index';

export const INPUT_STYLES =
  'shadow appearance-none border border-gray-500 rounded w-18 ' +
  'py-1 px-3 text-gray-300 placeholder-gray-700 leading-tight ' +
  'focus:outline-none focus:shadow-outline';

interface RangeSpecFormProps {
  title: string;
  onUpdate: (rangeSpec: RangeSpec) => void;
  initialValues?: RangeSpec;
}

const RangeSpecForm: React.FC<RangeSpecFormProps> = ({
  title,
  initialValues,
  onUpdate,
}) => {
  const [start, setStart] = useState<number | undefined>(initialValues?.start);
  const [step, setStep] = useState<number | undefined>(initialValues?.step);
  const [nSteps, setNSteps] = useState<number | undefined>(initialValues?.nSteps);
  const [list, setList] = useState<number[]>(new RangeSpec(initialValues).list);

  // Reusable input field component
  const renderInputField = (
    label: string,
    value: number | undefined,
    setValue: React.Dispatch<React.SetStateAction<number | undefined>>
  ) => (
    <div className="mb-1 flex items-center space-x-3">
      <label htmlFor={label} className="w-20 text-right">
        {label}:
      </label>
      <input
        type="number"
        id={label}
        className={INPUT_STYLES + ' w-16'}
        value={value === undefined ? '' : value}
        min={label === 'nSteps' ? 1 : undefined}
        onChange={(e) => {
          const newValue =
            e.target.value === '' ? undefined : parseInt(e.target.value, 10);
          setValue(newValue);
          const lcLabel = label.toLowerCase();
          setList(
            new RangeSpec({
              start: lcLabel === 'start' ? newValue : start,
              step: lcLabel === 'step' ? newValue : step,
              nSteps: lcLabel === 'nSteps' ? newValue : nSteps,
            }).list
          );
        }}
      />
    </div>
  );

  useEffect(() => {
    console.log(`>>>>> useEffect() start=${start} step=${step} nSteps=${nSteps}`);
    onUpdate(new RangeSpec({ start, step, nSteps }));
  }, [start, step, nSteps]);

  return (
    <form className="bg-gray-800 text-gray-400 text-xs font-bold shadow-md rounded-xl px-2 py-1 mb-4">
      <div className="text-gray-100 text-sm ml-2 mb-2">{title}</div>
      <div className="flex flex-row">
        {renderInputField('Start', start, setStart)}
        {renderInputField('Step', step, setStep)}
        {renderInputField('nSteps', nSteps, setNSteps)}
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
