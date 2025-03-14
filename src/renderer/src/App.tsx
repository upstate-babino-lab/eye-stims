import { useState } from 'react';
import StimPreviewTab from './StimPreviewTab';
import StimSequenceTab from './StimSequenceTab';
import Button from './components/Button';
import { useTheStimSequence } from './StateContext';

const tabs = ['Preview', 'Run'];

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { theStimSequence } = useTheStimSequence();

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-900 text-white p-4">
      <div className="flex flex-row">
        <div className="flex flex-col">
          {theStimSequence && (
            <>
              <div className="font-bold text-xl">{theStimSequence.name}</div>
              <div>{theStimSequence.description}</div>
              <div>
                Count: {theStimSequence.stimuli.length + ' | '}
                Duration: {theStimSequence.duration()}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col ml-auto">
          <Button onClick={() => window.electron.send('load-file')}>Load</Button>
          <div>Resolution: www x lll px</div>
          <Button onClick={() => window.electron.send('load-file')}>
            Save .mp4
          </Button>
        </div>
      </div>

      {theStimSequence &&
        <div>
          <div className="shrink-0 border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`flex-1 p-3 text-center cursor-pointer transition-colors duration-300
              ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grow p-6 text-center text-lg">
            {activeTab === 'StimSequence' && <StimSequenceTab />}
            {activeTab === 'StimPreview' && <StimPreviewTab />}
            {activeTab === 'Start' && <p>Start running the sequence</p>}
          </div>
        </div>
      }
    </div>
  );
}
