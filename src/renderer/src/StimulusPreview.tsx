import { useState } from 'react';
import { StimTypeName, Stimulus, stimConstructors } from './stimulus';
import { encodeStimuliAsync } from './video';
import Button from './components/Button';
import InputField from './components/InputField';

// Pane to preview one single Stimulus
export default function StimulusPreview(props: {
  className?: string;
  stimulus: Stimulus;
}) {
  const [stimulus, setStimulus] = useState<Stimulus>(
    new stimConstructors[props.stimulus.name](props.stimulus)
  );
  return (
    <div className={`flex flex-col ${props.className || ''}`}>
      <div className="flex flex-row items-center p-1 gap-1 ml-auto">
        <Button onClick={() => EncodeStim(stimulus)}>Test encoder</Button>
        <Button onClick={() => PreviewStim(stimulus)}>Preview</Button>
      </div>
      <div className="flex flex-row p-1 gap-2">
        <StimForm
          initialStim={props.stimulus}
          onNewStim={(newStim) => setStimulus(newStim)}
        />
        <PreviewCanvas />
      </div>
    </div>
  );
}

function StimForm(props: {
  initialStim: Stimulus;
  onNewStim?: (newStim: Stimulus) => void;
}) {
  const [stimulus, setStimulus] = useState<Stimulus>(props.initialStim);
  //const [stimJson, setStimJson] = useState('');
  //const [jsonError, setJsonError] = useState('');

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
    if (props.onNewStim) {
      props.onNewStim(newStim);
    }
    return newStim;
  }

  function handleStimNameChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setNewStimulus(value as StimTypeName);
  }

  function handleStimPropChange(propName, newValue) {
    const overrides = {};
    overrides[propName] = newValue;
    setNewStimulus(stimulus.name, overrides);
  }

  /* Handle JSON input change and validation
  const handleJsonChange = (newValue: unknown) => {
    const newJson = newValue as string;
    try {
      const parsedJson = JSON.parse(newJson); // Attempt to parse JSON
      setJsonError(''); // Clear error if valid
      setNewStimulus(stimulus.name, parsedJson);
    } catch (error) {
      setJsonError('Invalid JSON' + error); // Set error if invalid
    }
  };
*/

  const formStyles =
    ' bg-gray-800 h-7 border-1 border-gray-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500';

  const stimKeys = Reflect.ownKeys(stimulus) // Subclass and superclass props including symbols
    .filter((k) => typeof k !== 'symbol');

  return (
    <div className="flex flex-row gap-4 text-gray-400">
      <div className="flex flex-col text-gray-500">
        {/* StimTypeName name is special */}
        <div className={'text-left border-b-1 border-gray-900 text-white'}>TypeName:</div>
        {stimKeys
          .filter((n) => n !== 'name')
          .map((propName) => (
            <div key={propName} className={'text-left border-b-1 h-7 border-gray-900'}>
              {propName + ': '}
            </div>
          ))}
      </div>

      <div className="flex flex-col">
        {/* StimTypeName name is special */}
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

        {stimKeys
          .filter((n) => n !== 'name')
          .map((propName) => (
            <InputField
              key={propName}
              currentValue={stimulus[propName]}
              className={formStyles}
              onChange={(newValue) => handleStimPropChange(propName, newValue)}
            />
          ))}
        {/*
          <InputField
            className={'w-16' + formStyles}
            currentValue={stimulus.duration}
            onChange={(newValue) => {
              setNewStimulus(stimulus.name, {
                duration: newValue,
              });
            }}
          />
          <div className="flex-1">
            <InputField
              className={'w-full' + formStyles}
              currentValue={stimJson}
              onChange={handleJsonChange}
            />
            {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
          </div>
          */}
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

function PreviewStim(stimulus: Stimulus) {
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
  stimulus.preview(ctx, () => {
    // Clear back to default
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

// For testing only
function EncodeStim(stimulus: Stimulus) {
  encodeStimuliAsync([stimulus], 640, 400, 30).then((buf) => {
    downloadBlob(new Blob([buf]), 'stimulus.mp4');
  });
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
