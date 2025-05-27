import { useEffect, useState } from 'react';
import Button from './components/Button';
import { useAppState } from './StateContext';
import SpecTab from './tabs/SpecTab';
import BuildTab from './tabs/BuildTab';
import RunTab from './tabs/RunTab';
import SequencePreviewTab from './tabs/SequencePreviewTab';
import { formatSeconds } from './render-utils';
import { getBasename } from '../shared-utils';

const tabLabels = ['Preview', 'Build', 'Run'];

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const { theStimSequence } = useAppState();

  useEffect(() => {
    if (theStimSequence && theStimSequence.loadedPath.endsWith('.spec.json')) {
      // First tab should be 'Spec'
      if (tabLabels[0] !== 'Spec') {
        tabLabels.unshift('Spec');
      }
    } else {
      // Remove 'Spec' tab if it exists
      const specIndex = tabLabels.indexOf('Spec');
      if (specIndex !== -1) {
        tabLabels.splice(specIndex, 1);
      }
    }
    setActiveTab(tabLabels[0]); // Reset to the first tab
  }, [theStimSequence]);

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
                <div className="text-gray-500">
                  <span className="text-gray-300">
                    {getBasename(theStimSequence.loadedPath)}
                  </span>{' '}
                  {' | '}
                  Count: {theStimSequence.stimuli.length + ' | '}
                  Duration: {formatSeconds(theStimSequence.duration() / 1000)}
                </div>
                <div className="text-gray-400">
                  {theStimSequence.description}&nbsp;
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
          <a
            target="_blank"
            className="underline text-blue-700"
            href="https://github.com/upstate-babino-lab/eye-stims/issues/"
            rel="noreferrer"
          >
            GitHub issues
          </a>
        </div>
      </div>

      {theStimSequence && (
        <>
          <div className="shrink-0 border-b border-gray-700">
            {tabLabels.map((tabLabel) => (
              <button
                key={tabLabel}
                className={`flex-1 px-3 py-2 text-center cursor-pointer transition-colors duration-300 text-xl 
                  ${activeTab === tabLabel ? 'border-b-2 border-blue-700 text-blue-500' : 'text-gray-400 hover:text-gray-500'}`}
                onClick={() => setActiveTab(tabLabel)}
              >
                {tabLabel}
              </button>
            ))}
          </div>

          {activeTab === 'Spec' && <SpecTab />}
          {activeTab === 'Preview' && <SequencePreviewTab />}
          {activeTab === 'Build' && <BuildTab />}
          {activeTab === 'Run' && <RunTab />}
        </>
      )}
    </div>
  );
}
