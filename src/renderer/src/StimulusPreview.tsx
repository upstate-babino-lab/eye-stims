import { useState } from 'react';
import { StimTypeName, Stimulus, stimConstructors } from './stimulus';
import { encodeStimuliAsync } from './video';
import Button from './components/Button';

// Pane to preview one single Stimulus
export default function StimulusPreview(props: { stimulus: Stimulus }) {
  return (
    <div className="flex flex-row">
      <StimForm />
      <PreviewCanvas />
    </div>
  );

  function StimForm() {
    const [stimulus, setStimulus] = useState<Stimulus>(props.stimulus);
    const [stimJson, setStimJson] = useState('');
    const [jsonError, setJsonError] = useState('');

    // Dropdown options
    const stimTypeNames = Object.keys(StimTypeName); //.filter((key) => isNaN(Number(key)));

    function setNewStimulus(
      stimTypeName: StimTypeName,
      overrides?: object
    ): Stimulus {
      const newStim = new stimConstructors[stimTypeName]({
        ...stimulus, // properties that remain the same
        ...overrides, // last properties win
      });
      setStimulus(newStim);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, duration, ...otherProps } = newStim;
      setStimJson(JSON.stringify(otherProps));

      return newStim;
    }

    function handleStimNameChange(e: React.ChangeEvent<HTMLSelectElement>) {
      const value = e.target.value;
      setNewStimulus(value as StimTypeName);
    }

    // Handle JSON input change and validation
    const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newJson = e.target.value;
      try {
        const parsedJson = JSON.parse(newJson); // Attempt to parse JSON
        setJsonError(''); // Clear error if valid
        setNewStimulus(stimulus.name, parsedJson);
      } catch (error) {
        setJsonError('Invalid JSON' + error); // Set error if invalid
      }
    };

    function handlePreviewClick() {
      // console.log('>>>>> handlePreviewClick() with stim=' + JSON.stringify(stim));
      const canvasContainer = document.getElementById('canvas-container');
      const canvas = document.getElementById(
        'preview-canvas'
      ) as HTMLCanvasElement;
      if (!canvasContainer || !canvas) {
        throw new Error('Invalid HTML canvas');
      }
      canvas.width = canvasContainer.offsetWidth - 2;
      canvas.height = canvasContainer.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Invalid context from canvas');
      }
      stimulus.preview(ctx, () => {
        // Clear back to default
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    // For testing only
    function handleEncoderClick() {
      encodeStimuliAsync([stimulus], 640, 400, 30).then((buf) => {
        downloadBlob(new Blob([buf]), 'stimulus.mp4');
      });
    }

    const formStyles =
      ' bg-gray-800 border border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500';

    return (
      <div className="flex flex-row gap-4 text-gray-400">
        <div className="flex flex-col text-gray-500">
          {Reflect.ownKeys(stimulus) // Subclass and superclass props including symbols
            .filter((k) => typeof k !== 'symbol')
            .map((propName) => (
              <div key={propName} className={'text-left'}>
                {propName + ': '}
              </div>
            ))}
        </div>
        <div className="flex flex-col">
          <select
            value={stimulus.name}
            onChange={handleStimNameChange}
            className={formStyles}
          >
            {stimTypeNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            className={'w-16' + formStyles}
            type="number"
            value={stimulus.duration}
            onChange={(e) => {
              setNewStimulus(stimulus.name, {
                duration: parseFloat(e.target.value),
              });
            }}
            step="0.1"
          />
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
        <div className="flex flex-col">
          <Button onClick={handlePreviewClick}>Preview</Button>
          <Button onClick={handleEncoderClick}>Test encoder</Button>
        </div>
      </div>
    );
  }
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
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
