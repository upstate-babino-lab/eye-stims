import React from 'react';

type InputFieldProps = React.HTMLAttributes<HTMLElement> & {
  value: unknown;
  step?: string;
  onChange: (newValue: unknown) => void;
};

const InputField: React.FC<InputFieldProps> = ({
  value,
  step,
  onChange,
  ...otherProps
}) => {
  const valueType = typeof value;

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = parseFloat(e.target.value);
    onChange(newNumber);
  };

  const handleString = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newString = e.target.value;
    onChange(newString);
  };

  switch (valueType) {
    case 'number':
      return (
        <input
          {...otherProps} // Including key, className, etc.
          type="number"
          step={step}
          value={Math.round((value as number) * 10000) / 10000} // More compact formatting
          onChange={handleNumber}
        />
      );
    case 'string':
      return (
        <input
          {...otherProps}
          type="text"
          value={value as string}
          onChange={handleString}
        />
      );
    default:
      return <div>Input field for type {valueType} not implemented yet</div>;
  }
};
export default InputField;
