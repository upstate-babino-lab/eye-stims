/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react';
import { StimTypeName, stimConstructors } from './stimulus';
import { encodeStimuliAsync } from './video';

import Button from './components/Button';

export default function StimPreview() {
  return (
    <div className="flex flex-col h-[82vh]">
      <StimForm />
      <PreviewCanvas />
    </div>
  );
}

function StimForm() {
  const [stimName, setStimName] = useState('Solid');
  const [durationSeconds, setDurationSeconds] = useState(1.0);
  const [stimJson, setStimJson] = useState('{"bgColor": "black"}');
  const [jsonError, setJsonError] = useState('');

  // Dropdown options
  const stimTypeNames = Object.keys(StimTypeName); //.filter((key) => isNaN(Number(key)));

  // Handle JSON input change and validation
  const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStimJson(value);

    try {
      JSON.parse(value); // Attempt to parse JSON
      setJsonError(''); // Clear error if valid
    } catch (error) {
      setJsonError('Invalid JSON' + error); // Set error if invalid
    }
  };

  function handleStimNameChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setStimName(value);
    const stim = new stimConstructors[value]();
    delete stim.name;
    delete stim.duration;
    setStimJson(JSON.stringify(stim));
  }

  // For testing only
  function handleEncoderClick() {
    const stim = new stimConstructors[stimName]({
      duration: durationSeconds,
      ...JSON.parse(stimJson),
    });
    encodeStimuliAsync([stim], 640, 400, 30).then((buf) => {
      downloadBlob(new Blob([buf]), 'stimulus.mp4');
    })
  }

  function handlePreviewClick() {
    const stim = new stimConstructors[stimName]({
      duration: durationSeconds,
      ...JSON.parse(stimJson),
    });
    // console.log('>>>>> handlePreviewClick() with stim=' + JSON.stringify(stim));
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
    if (!canvasContainer || !canvas) {
      throw new Error('Invalid HTML canvas');
    }
    canvas.width = canvasContainer.offsetWidth - 2;
    canvas.height = canvasContainer.offsetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Invalid context from canvas');
    }
    stim.preview(ctx, () => {
      // Clear back to default
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  const formStyles =
    ' bg-gray-300 border focus:outline-hidden focus:ring-2 focus:ring-blue-500';

  return (
    <div className="flex gap-4 items-center py-2 rounded-lg shadow-xs text-gray-500">
      <div className="flex-col space-y-1">
        <div className="text-left">Name</div>
        <select
          value={stimName}
          onChange={handleStimNameChange}
          className={formStyles}
        >
          {stimTypeNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-col space-y-1">
        <div className="text-left">Seconds</div>
        <input
          className={'w-16' + formStyles}
          type="number"
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(parseFloat(e.target.value))}
          step="0.1"
        />
      </div>

      <div className="flex-col w-full space-y-1">
        <div className="flex justify-between">
          <div>JSON</div>
          <div>
            <Button onClick={handleEncoderClick}>Test encoder</Button>
            <Button onClick={handlePreviewClick}>Preview</Button>
          </div>
        </div>
        <div className="flex-1">
          <input
            className={'w-full' + formStyles}
            type="text"
            value={stimJson}
            onChange={handleJsonChange}
          />
          {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
        </div>
      </div>
    </div>
  );
}

function PreviewCanvas() {
  return (
    <div id="canvas-container" className="grow bg-gray-400 border">
      <canvas id="preview-canvas" />
    </div>
  );
}


function downloadBlob(blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

