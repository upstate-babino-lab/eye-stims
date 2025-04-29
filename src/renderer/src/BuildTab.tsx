import Button from './components/Button';
import { useTheStimSequence } from './StateContext';
import { DisplayKey, displays } from '../../displays';
import { useState } from 'react';

export function BuildTab() {
  const { theStimSequence } = useTheStimSequence();
  const [displayKey, setDisplayKey] = useState<DisplayKey>(
    DisplayKey[Object.keys(displays)[0]]
  );

  const [progress, setProgress] = useState<string>('');
  const [ffmpegOutput, setFfmpegOutput] = useState<string>('');

  return (
    <div>
      {' '}
      {theStimSequence && (
        <div className="flex pt-4 pb-0 flex-col gap-2 w-fit">
          <DisplaysDropdown
            initialValue={displayKey}
            onChange={(newDisplayKey) => {
              setDisplayKey(newDisplayKey);
            }}
          />
          {/*}
          <Button
            className=""
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
          */}
          <Button
            className=""
            onClick={async () => {
              setProgress(``);
              setFfmpegOutput('');
              try {
                await theStimSequence.saveToCacheAsync(
                  displayKey,
                  (label, nDone, nTotal) =>
                    setProgress(`${label} ${nDone} / ${nTotal}`)
                );
              } catch (err) {
                setFfmpegOutput('saveToCacheAsync() err=' + err);
              }
            }}
          >
            Save to cache
          </Button>

          <Button
            className=""
            onClick={async () => {
              setProgress(``);
              setFfmpegOutput('');
              try {
                const resultMessage = await theStimSequence.buildFromCacheAsync(
                  displayKey,
                  (message, nDone?, nTotal?) => {
                    if (nDone || nTotal) {
                      setProgress(`${message} ${nDone} / ${nTotal}`);
                    } else {
                      setProgress(message);
                    }
                  }
                );
                setFfmpegOutput(resultMessage);
              } catch (err) {
                setFfmpegOutput('buildFromCacheAsync err=' + err);
              }
            }}
          >
            Build
          </Button>
          <div>{progress}</div>
          <div>ffmpeg output: {ffmpegOutput}</div>
        </div>
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
          {key}: {displayProps.width}x{displayProps.height} {displayProps.fps}fps
        </option>
      ))}
    </select>
  );
}
