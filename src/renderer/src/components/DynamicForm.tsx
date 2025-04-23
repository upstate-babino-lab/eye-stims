import { capitalize } from '@renderer/render-utils';
import React, { useState } from 'react';
import Button from './Button';

export interface FieldConfig {
  label?: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'radio' | 'select';
  options?: string[];
  defaultValue?: string | number;
  required?: boolean;
  min?: number;
  max?: number;
}

interface Props {
  config: FieldConfig[];
  onSubmit: (data: Record<string, unknown>) => void;
  labelClassName?: string;
  inputClassName?: string;
}

const DynamicForm: React.FC<Props> = ({
  config,
  onSubmit,
  labelClassName,
  inputClassName,
}) => {
  // Initialize state with default values
  const initialState = config.reduce(
    (acc, field) => {
      acc[field.name] = field.defaultValue || '';
      return acc;
    },
    {} as Record<string, unknown>
  );

  const [formData, setFormData] = useState(initialState);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      {config.map((field) => (
        <div key={field.name}>
          <label className={labelClassName}>
            {(field.label || capitalize(field.name)) + ': '}
            {field.type === 'text' ||
            field.type === 'number' ||
            field.type === 'date' ? (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] as string}
                onChange={handleChange}
                required={field.required}
                min={field.min}
                max={field.max}
                className={inputClassName}
              />
            ) : field.type === 'radio' ? (
              field.options?.map((option) => (
                <label key={option} className={labelClassName}>
                  <input
                    type="radio"
                    name={field.name}
                    value={option}
                    checked={formData[field.name] === option}
                    onChange={handleChange}
                    required={field.required}
                    className={inputClassName}
                  />
                  {option}
                </label>
              ))
            ) : field.type === 'select' && field.options ? (
              <select
                name={field.name}
                value={formData[field.name] as string}
                onChange={handleChange}
                required={field.required}
                className={inputClassName}
              >
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : null}
          </label>
        </div>
      ))}
      <div className="pt-4 pl-40">
        <Button>Start Running</Button>
      </div>
    </form>
  );
};

export default DynamicForm;
