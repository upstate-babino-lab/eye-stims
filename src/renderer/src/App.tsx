import { useState } from 'react';
import PreviewPane from './PreviewPane';
import Button from './components/Button';
import { useTheStimSequence } from './StateContext';

const tabLabels = ['Preview', 'Run'];

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const { theStimSequence } = useTheStimSequence();

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-900 text-gray-400 text-sm p-4">
      <div className="flex flex-row">
        <div className="flex flex-col">
          {theStimSequence && (
            <>
              <div className="font-bold text-xl text-white">
                {theStimSequence.name}
              </div>
              <div>{theStimSequence.description}</div>
              <div>
                Count: {theStimSequence.stimuli.length + ' | '}
                Duration: {theStimSequence.duration()}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-1 ml-auto">
          <Button onClick={() => window.electron.send('load-file')}>Load</Button>
          <div>Resolution: www x lll px</div>
          <Button onClick={() => window.electron.send('load-file')}>
            Save .mp4
          </Button>
        </div>
      </div>

      {theStimSequence && (
        <div>
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

          <div className="grow p-6 text-center text-lg">
            {activeTab === 'Preview' && <PreviewPane />}
            {activeTab === 'Run' && <p>Start running the sequence</p>}
          </div>
        </div>
      )}
    </div>
  );
}
