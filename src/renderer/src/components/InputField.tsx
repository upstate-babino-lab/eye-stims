import React from 'react';

type InputFieldProps = React.HTMLAttributes<HTMLElement> & {
  value: unknown;
  formatNumber?: boolean;
  onChange: (newValue: unknown) => void;
};

const InputField: React.FC<InputFieldProps> = ({ ...otherProps }) => {
  const valueType = typeof otherProps.value;

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = parseFloat(e.target.value);
    otherProps.onChange(newNumber);
  };

  const handleString = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newString = e.target.value;
    otherProps.onChange(newString);
  };

  const formatNumberInput = otherProps.formatNumber ? numberFormatter : () => {};

  switch (valueType) {
    case 'number':
      return (
        <input
          {...otherProps} // Including key, className, etc.
          type="number"
          value={otherProps.value as number}
          onChange={handleNumber}
          onBlur={formatNumberInput}
          onFocus={formatNumberInput}
        />
      );
    case 'string':
      return (
        <input
          {...otherProps}
          type="text"
          value={otherProps.value as string}
          onChange={handleString}
        />
      );
    default:
      return <div>Input field for type {valueType} not implemented yet</div>;
  }
};
export default InputField;

function numberFormatter(event) {
  const input = event.target;
  if (input.value !== '') {
    if (!isNaN(parseFloat(input.value))) {
      input.value = parseFloat(input.value).toFixed(2);
    }
  }
}
