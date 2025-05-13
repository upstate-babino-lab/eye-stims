import React, { useEffect, useState } from 'react';
import { RangeSpec } from '../stims/StimsSpec';
import { BUTTON_STYLES } from './Button';

export const INPUT_STYLES =
  'shadow appearance-none border border-gray-500 rounded w-27 ' +
  'py-1 px-3 text-gray-300 placeholder-gray-700 leading-tight ' +
  'focus:outline-none focus:shadow-outline';

export const LABEL_STYLES = 'block ml-4 w-24';

interface RangeSpecFormProps {
  title: string;
  onSubmit: (rangeSpec: RangeSpec) => void;
  initialValues?: RangeSpec;
}

const RangeSpecForm: React.FC<RangeSpecFormProps> = ({
  title,
  onSubmit,
  initialValues,
}) => {
  const [start, setStart] = useState<number | undefined>(initialValues?.start);
  const [step, setStep] = useState<number | undefined>(initialValues?.step);
  const [end, setEnd] = useState<number | undefined>(initialValues?.end);
  const [listString, setListString] = useState<string>(
    initialValues?.list?.join(',') || ''
  );

  // Update state when initialValues prop changes
  useEffect(() => {
    setStart(initialValues?.start);
    setStep(initialValues?.step);
    setEnd(initialValues?.end);
    setListString(initialValues?.list?.join(',') || '');
  }, [initialValues]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const rangeSpec: RangeSpec = {};

    if (start !== undefined) {
      rangeSpec.start = start;
    }
    if (step !== undefined) {
      rangeSpec.step = step;
    }
    if (end !== undefined) {
      rangeSpec.end = end;
    }
    if (listString.trim() !== '') {
      const parsedList = listString
        .split(',')
        .map((item) => parseInt(item.trim(), 10))
        .filter((num) => !isNaN(num));
      if (parsedList.length > 0) {
        rangeSpec.list = parsedList;
      }
    }

    onSubmit(rangeSpec);
  };

  const handleReset = () => {
    setStart(initialValues?.start);
    setStep(initialValues?.step);
    setEnd(initialValues?.end);
    setListString(initialValues?.list?.join(',') || '');
  };

  // Reusable input field component
  const renderInputField = (
    id: string,
    label: string,
    value: number | undefined,
    setValue: React.Dispatch<React.SetStateAction<number | undefined>>,
    placeholder: string
  ) => (
    <div className="mb-1 flex items-center">
      <label htmlFor={id} className={LABEL_STYLES}>
        {label}:
      </label>
      <input
        type="number"
        id={id}
        className={INPUT_STYLES}
        value={value === undefined ? '' : value}
        onChange={(e) =>
          setValue(
            e.target.value === '' ? undefined : parseInt(e.target.value, 10)
          )
        }
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 text-gray-400 text-xs font-bold shadow-md rounded-xl px-8 py-2 mb-4"
    >
      <div className="text-gray-100 text-sm -ml-5">{title}</div>
      {renderInputField('start', 'Start', start, setStart, 'Optional')}
      {renderInputField('step', 'Step', step, setStep, 'Optional')}
      {renderInputField('end', 'End', end, setEnd, 'Optional')}
      <div className="mb-4 flex items-center">
        <label htmlFor="list" className={LABEL_STYLES}>
          List:
        </label>
        <input
          type="text"
          id="list"
          className={INPUT_STYLES + ' w-full'}
          value={listString}
          onChange={(e) => setListString(e.target.value)}
          placeholder="Comma-separated numbers"
        />
      </div>
      <div className="flex items-center justify-between">
        <button className={BUTTON_STYLES} type="submit">
          Set
        </button>
        {initialValues && (
          <button
            type="button"
            className={
              BUTTON_STYLES + 'bg-gray-300 hover:bg-gray-400 text-gray-800'
            }
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
};

export default RangeSpecForm;
