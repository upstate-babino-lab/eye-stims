import { useState } from 'react';
import Button from './components/Button';
import { useTheStimSequence } from './StateContext';
import SequencePreviewTab from './SequencePreviewTab';
import { downloadBlob, formatSeconds } from './utilities';
import { encodeStimuliAsync } from './video';
import RunTab from './RunTab';

const tabLabels = ['Preview', 'Run'];

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const { theStimSequence } = useTheStimSequence();

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
            onClick={() => window.electron.send('load-file')}
          >
            Load
          </Button>
          {theStimSequence && (
            <div className="flex pt-4 pb-0 flex-col gap-2 ml-auto">
              <ResolutionDropdown />
              <Button
                className="ml-auto"
                onClick={() => {
                  encodeStimuliAsync(theStimSequence.stimuli, 640, 400, 30).then(
                    (blob) => {
                      if (blob) {
                        downloadBlob(blob, 'stimulus.mp4');
                      } else {
                        console.log('Error: Expected Blob')
                      }
                    }
                  );
                }}
              >
                Download .mp4
              </Button>

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
                  encodeStimuliAsync(
                    theStimSequence.stimuli,
                    640,
                    400,
                    30,
                    fileStream
                  ).then((blob) => {
                    if (blob) {
                      console.log(
                        'Error: Expected null after streaming file to disk, not a Blob'
                      );
                    }
                  });
                }}
              >
                Stream to disk .mp4
              </Button>
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

const ResolutionDropdown = () => {
  const [resolution, setResolution] = useState('640x480');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResolution(e.target.value);
  };

  return (
    <div className="flex flex-row gap-0">
      <label className="text-gray-500">Resolution:&nbsp;</label>
      <select
        value={resolution}
        onChange={handleChange}
        className="px-2 text-black rounded-sm bg-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="640x480">640 x 480</option>
        <option value="1140x912">1140 x 912</option>
      </select>
    </div>
  );
};
