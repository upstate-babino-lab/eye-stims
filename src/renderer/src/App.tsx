import { useState } from 'react';
import Button from './components/Button';
import { useTheStimSequence } from './StateContext';
import SequencePreviewTab from './SequencePreviewTab';
import { formatSeconds } from './utilities';
import RunTab from './RunTab';
import { DisplayKey, displays } from '../../displays';

const tabLabels = ['Preview', 'Run'];

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const { theStimSequence } = useTheStimSequence();
  const [displayKey, setDisplayKey] = useState<DisplayKey>(
    DisplayKey[Object.keys(displays)[0]]
  );
  const [ffmpegOutput, setFfmpegOutput] = useState<string>('');

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-400 text-sm p-4">
      <div className="flex flex-row gap-1.5">
        <div className="flex flex-col">
          {theStimSequence && (
            <>
              <div className="font-bold text-xl text-white">
                {theStimSequence.name}
              </div>
              <div className="bg-gray-950 rounded-md p-2">
                <div>{theStimSequence.description}&nbsp;</div>
                <div className="text-gray-500">
                  {theStimSequence.fileBasename + ' | '}
                  Count: {theStimSequence.stimuli.length + ' | '}
                  Duration: {formatSeconds(theStimSequence.duration())}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 ml-auto">
          <Button
            className="ml-auto"
            onClick={() => {
              setFfmpegOutput(''); // Clear upon load
              window.electron.send('loadFile');
            }}
          >
            Load
          </Button>
          {theStimSequence && (
            <div className="flex pt-4 pb-0 flex-col gap-2 ml-auto">
              <DisplaysDropdown
                initialValue={displayKey}
                onChange={(newDisplayKey) => {
                  setDisplayKey(newDisplayKey);
                }}
              />
              <Button
                className="ml-auto"
                onClick={async () => {
                  const fileHandle = await window.showSaveFilePicker({
                    suggestedName: `streamed-video.mp4`,
                    types: [
                      {
                        description: 'Video File',
                        accept: { 'video/mp4': ['.mp4'] },
                      },
                    ],
                  });
                  const fileStream = await fileHandle.createWritable();
                  theStimSequence.encodeAsync(displayKey, fileStream);
                }}
              >
                Stream to disk .mp4
              </Button>

              <Button
                className="ml-auto"
                onClick={async () => {
                  try {
                    theStimSequence.saveToCacheAsync(displayKey);
                  } catch (err) {
                    setFfmpegOutput('saveToCacheAsync() err=' + err);
                  }
                }}
              >
                Save to cache
              </Button>

              <Button
                className="ml-auto"
                onClick={async () => {
                  try {
                    const result =
                      await theStimSequence.buildFromCacheAsync(displayKey);
                    setFfmpegOutput(result);
                  } catch (err) {
                    setFfmpegOutput('buildFromCacheAsync err=' + err);
                  }
                }}
              >
                Build
              </Button>
              <div>ffmpeg output: {ffmpegOutput}</div>
            </div>
          )}
        </div>
      </div>

      {theStimSequence && (
        <>
          <div className="shrink-0 border-b border-gray-700">
            {tabLabels.map((tabLabel) => (
              <button
                key={tabLabel}
                className={`flex-1 px-3 py-2 text-center cursor-pointer transition-colors duration-300 text-xl 
                  ${activeTab === tabLabel ? 'border-b-2 border-blue-700 text-blue-500' : 'text-gray-600 hover:text-gray-500'}`}
                onClick={() => setActiveTab(tabLabel)}
              >
                {tabLabel}
              </button>
            ))}
          </div>

          {activeTab === 'Preview' && <SequencePreviewTab />}
          {activeTab === 'Run' && <RunTab />}
        </>
      )}
    </div>
  );
}

function DisplaysDropdown(props: {
  initialValue: DisplayKey;
  onChange: (value: DisplayKey) => void;
}) {
  const [selectedValue, setSelectedValue] = useState(props.initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    setSelectedValue(DisplayKey[newValue]);
    props.onChange(DisplayKey[newValue]);
  };

  return (
    <select
      value={selectedValue}
      onChange={handleChange}
      className="px-2 text-black rounded-sm bg-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      {Object.entries(displays).map(([key, displayProps]) => (
        <option key={key} value={key}>
          {key} ({displayProps.width}x{displayProps.height} {displayProps.fps}fps)
        </option>
      ))}
    </select>
  );
}
