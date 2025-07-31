import Button from '../components/Button';
import { useAppState } from '../StateContext';
import { DisplayKey, displays } from '../../displays';
import { useEffect, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import StimSequence, { ProgressCallback } from '../StimSequence';
import { getBasename } from '../../shared-utils';

export default function BuildTab() {
  const { theStimsMeta, theStimSequence } = useAppState();
  const [displayKey, setDisplayKey] = useState<DisplayKey>(
    DisplayKey[Object.keys(displays)[0]]
  );

  const [progressText, setProgressText] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(-1);
  const [ffmpegOutput, setFfmpegOutput] = useState<string>('');

  // Update from StimsSpec if we're using one
  const { theParadigm: theStimsSpec, setTheStimSequence } = useAppState();
  useEffect(() => {
    if (theStimsSpec) {
      setTheStimSequence(new StimSequence(theStimsSpec.stimuli()));
    }
  }, [setTheStimSequence, theStimsSpec]);

  const handleProgress: ProgressCallback = (
    label: string,
    nDone: number = 0,
    nTotal: number = 0
  ) => {
    if (nTotal) {
      setProgressText(`${label} ${nDone} / ${nTotal}`);
      setProgressPercent(Math.round((100 * nDone) / nTotal));
    } else {
      setProgressText(label);
      setProgressPercent(0);
    }
  };

  return (
    <div>
      {' '}
      {theStimSequence && (
        <div className="flex pt-4 pb-0 flex-col gap-2">
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
          <Button
            className=""
            onClick={async () => {
              setProgressText(``);
              setFfmpegOutput('');
              try {
                await theStimSequence.saveToCacheAsync(displayKey, handleProgress);
              } catch (err) {
                setFfmpegOutput('saveToCacheAsync() err=' + err);
              }
            }}
          >
            Save to cache
          </Button>
          */}

          <Button
            className=""
            onClick={async () => {
              setProgressText(``);
              setFfmpegOutput('');
              try {
                let basename = getBasename(
                  theStimsMeta?.loadedPath || theStimsMeta?.title || 'mystims',
                  true
                );
                if (basename.endsWith('.stims')) {
                  basename = getBasename(basename, true);
                }
                const resultMessage = await theStimSequence.buildFromCacheAsync(
                  basename,
                  displayKey,
                  theStimsMeta?.title,
                  theStimsMeta?.description,
                  handleProgress
                );
                setFfmpegOutput(resultMessage);
              } catch (err) {
                setFfmpegOutput('buildFromCacheAsync err=' + err);
              }
            }}
          >
            Build Video
          </Button>
          <div className="flex flex-row items-center w-full gap-4">
            <div className="whitespace-nowrap">{progressText}</div>
            {progressPercent > 0 && (
              <div className="flex-1">
                <ProgressBar
                  progress={progressPercent}
                  height="h-2"
                  color="bg-green-600"
                  backgroundColor="bg-gray-400"
                />
              </div>
            )}
          </div>
          {ffmpegOutput && <div>ffmpeg output: {ffmpegOutput}</div>}
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
    <div className="inline-flex">
      <select
        value={selectedValue}
        onChange={handleChange}
        className="w-auto px-2 text-black rounded-sm bg-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {Object.entries(displays).map(([key, displayProps]) => (
          <option key={key} value={key}>
            {key} - {displayProps.aspectRatio} {displayProps.width}x{displayProps.height} {displayProps.fps}fps
          </option>
        ))}
      </select>
    </div>
  );
}
