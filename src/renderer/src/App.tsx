import { useState } from 'react';
import Button from './components/Button';
import { useTheStimSequence } from './StateContext';
import SequencePreviewTab from './SequencePreviewTab';
import { formatSeconds } from './render-utils';
import RunTab from './RunTab';
import { BuildTab } from './BuildTab';

const tabLabels = ['Preview', 'Build', 'Run'];

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
                  {theStimSequence.fileBasename + ' | '}
                  Count: {theStimSequence.stimuli.length + ' | '}
                  Duration: {formatSeconds(theStimSequence.duration() / 1000)}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 ml-auto">
          <Button
            className="ml-auto"
            onClick={() => {
              window.electron.send('loadFile');
            }}
          >
            Load
          </Button>
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
          {activeTab === 'Build' && <BuildTab />}
          {activeTab === 'Run' && <RunTab />}
        </>
      )}
    </div>
  );
}
