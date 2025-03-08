/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react';
import { StimTypeName, Solid, stimConstructors } from './stimulus';

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
  const [stimJson, setStimJson] = useState(JSON.stringify(new Solid()));
  const [jsonError, setJsonError] = useState('');

  // Dropdown options
  const stimTypeNames = Object.keys(StimTypeName); //.filter((key) => isNaN(Number(key)));

  // Handle JSON input change and validation
  const handleJsonChange = (e) => {
    const value = e.target.value;
    setStimJson(value);

    try {
      JSON.parse(value); // Attempt to parse JSON
      setJsonError(''); // Clear error if valid
    } catch (error) {
      setJsonError('Invalid JSON' + error); // Set error if invalid
    }
  };

  function handleStimNameChange(e) {
    const value = e.target.value;
    setStimName(value);
    const stim = new stimConstructors[value]();
    setStimJson(JSON.stringify(stim));
  }

  const formStyles = 'bg-gray-300 border focus:outline-hidden focus:ring-2 focus:ring-blue-500';

  return (
    <div className="flex gap-4 items-center py-2 rounded-lg shadow-xs text-gray-500">
      <div className="flex-col">
        <div className="text-left">Name</div>
        <select value={stimName} onChange={handleStimNameChange} className={formStyles}>
          {stimTypeNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-col w-full">
        <div className="text-left">JSON</div>
        <div className="flex-1">
          <input
            type="text"
            value={stimJson}
            onChange={handleJsonChange}
            className={'w-full ' + formStyles}
          />
          {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
        </div>
      </div>
    </div>
  );
}

function Canvas() {
  return <div className="grow bg-gray-400 border">
    canvas to fill all remaining space
  </div>;
}