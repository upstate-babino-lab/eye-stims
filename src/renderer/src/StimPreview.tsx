/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react';

export default function StimPreview() {
  return (
    <div className="flex flex-col h-screen">
      <StimForm />
      <Canvas />
    </div>
  );
}

function StimForm() {
  const [stimName, setStimName] = useState('Solid');
  const [durationSeconds, setDurationSeconds] = useState(1.0);
  const [stimParameters, setStimParameters] = useState('{"foo": 42, "bar": 100}');
  const [jsonError, setJsonError] = useState('');

  // Dropdown options
  const dropdownOptions = [
    { value: 'solid', label: 'Solid' },
    { value: 'bar', label: 'Bar' },
    { value: 'option3', label: 'Option3' },
  ];

  // Handle JSON input change and validation
  const handleJsonChange = (e) => {
    const value = e.target.value;
    setStimParameters(value);

    try {
      JSON.parse(value); // Attempt to parse JSON
      setJsonError(''); // Clear error if valid
    } catch (error) {
      setJsonError('Invalid JSON' + error); // Set error if invalid
    }
  };

  return (
    <div className="flex gap-4 items-center p-2 rounded-lg shadow-sm text-gray-500">
      <div className="flex-col">
        <div className="text-left">StimType</div>
        <select
          value={stimName}
          onChange={(e) => setStimName(e.target.value)}
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Stimulus name</option>
          {dropdownOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-col">
        <div className="text-left">Seconds</div>
        <input
          type="number"
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(parseFloat(e.target.value))}
          step="0.1"
          className="w-20 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-col w-full">
        <div className="text-left">Parameters</div>
        <div className="flex-1">
          <input
            type="text"
            value={stimParameters}
            onChange={handleJsonChange}
            placeholder={stimParameters}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
        </div>
      </div>
    </div>
  );
}

function Canvas() {
  return <div className="flex-grow bg-gray-400 border">
    canvas to fill all remaining space
  </div>;
}