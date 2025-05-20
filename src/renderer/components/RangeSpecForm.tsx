import React, { useState } from 'react';
import RangeSpec from '../stims/RangeSpec';

export const INPUT_STYLES =
  'shadow appearance-none border border-gray-500 rounded w-27 ' +
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
  const [listString, setListString] = useState<string>(
    initialValues?.list?.join(',') || ''
  );

  // Reusable input field component
  const renderInputField = (
    id: string,
    label: string,
    value: number | undefined,
    setValue: React.Dispatch<React.SetStateAction<number | undefined>>,
    placeholder: string
  ) => (
    <div className="mb-3 flex items-center space-x-3">
      <label htmlFor={id} className="w-20 text-right">
        {label}:
      </label>
      <input
        type="number"
        id={id}
        className={INPUT_STYLES + ' w-16'}
        value={value === undefined ? '' : value}
        onChange={(e) => {
          const newValue =
            e.target.value === '' ? undefined : parseInt(e.target.value, 10);
          setValue(newValue);

          setListString(
            new RangeSpec({
              start: id === 'start' ? newValue : start,
              step: id === 'step' ? newValue : step,
              nSteps: id === 'nSteps' ? newValue : nSteps,
            }).list.join(', ')
          );
        }}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form
      className="bg-gray-800 text-gray-400 text-xs font-bold shadow-md rounded-xl px-8 py-2 mb-4"
      onChange={() => {
        onUpdate(new RangeSpec({ start, step, nSteps }));
      }}
    >
      <div className="text-gray-100 text-sm -ml-5 mb-3">{title}</div>
      <div className="flex flex-row">
        {renderInputField('start', 'Start', start, setStart, 'Optional')}
        {renderInputField('step', 'Step', step, setStep, 'Optional')}
        {renderInputField('nSteps', 'nSteps', nSteps, setNSteps, 'Optional')}
      </div>
      <div className="mb-4 flex items-center text-base space-x-2">
        <label className="w-20 text-right">List:</label>
        <span className="text-gray-200">{listString}</span>
      </div>
    </form>
  );
};

export default RangeSpecForm;
