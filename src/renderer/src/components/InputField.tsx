import React from 'react';

type InputFieldProps = React.HTMLAttributes<HTMLElement> & {
  currentValue: unknown;
  onChange: (newValue: unknown) => void;
};

const InputField: React.FC<InputFieldProps> = ({ ...otherProps }) => {
  const valueType = typeof otherProps.currentValue;

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = parseFloat(e.target.value);
    otherProps.onChange(newNumber);
  };

  const handleString = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newString = e.target.value;
    otherProps.onChange(newString);
  };

  switch (valueType) {
    case 'number':
      return (
        <input
          {...otherProps} // Including key, className, etc.
          type="number"
          value={(otherProps.currentValue as number).toFixed(2)}
          onChange={handleNumber}
        />
      );
    case 'string':
      return (
        <input
          {...otherProps}
          type="text"
          value={otherProps.currentValue as string}
          onChange={handleString}
        />
      );
    default:
      return <div>Input field for type {valueType} not implemented yet</div>;
  }
};
export default InputField;
