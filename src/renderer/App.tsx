import { useEffect, useState } from 'react';
import Button from './components/Button';
import { useAppState } from './StateContext';
import AssayTab from './tabs/AssayTab';
import BuildTab from './tabs/BuildTab';
import RunTab from './tabs/RunTab';
import StimsTab from './tabs/StimsTab';
import { formatSeconds, saveFileDialogAsync } from './render-utils';
import { getBasename } from '../shared-utils';
import { AssayType, newAssay } from '@src/assays/index';

export default function App(): JSX.Element {
  const [tabLabels, setTabLabels] = useState<string[]>(['Stims', 'Build', 'Run']);
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const {
    theStimsMeta,
    setTheStimsMeta,
    theAssay: theStimsSpec,
    setTheAssay: setTheStimsSpec,
    theStimSequence,
  } = useAppState();

  useEffect(() => {
    if (theStimsSpec) {
      setTabLabels(['Assay', 'Stims', 'Build', 'Run']);
    } else {
      setTabLabels(['Stims', 'Build', 'Run']);
    }
  }, [theStimsSpec]);

  const durationSeconds =
    (theStimsMeta?.totalDurationMS || theStimSequence?.duration() || 0) / 1000;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-400 text-sm p-4">
      <div className="flex flex-row gap-1.5">
        <div className="flex flex-col">
          {theStimsMeta && (
            <>
              <div className="font-bold text-xl text-white">
                {theStimsMeta.title}
              </div>
              <div className="bg-gray-950 rounded-md p-2">
                <div className="text-gray-400">
                  <span className="text-gray-300">
                    {theStimsMeta.loadedPath
                      ? getBasename(theStimsMeta.loadedPath)
                      : '?' + (theStimsSpec ? '.assay' : '') + '.json'}
                  </span>{' '}
                  <span className="text-gray-600">{' | '}</span>
                  Count:{' '}
                  {theStimsMeta.count || theStimSequence?.stimuli.length || '?'}
                  <span className="text-gray-600">{' | '}</span>
                  Duration:{' '}
                  {durationSeconds ? formatSeconds(durationSeconds) : '?'}
                </div>
                <div className="text-gray-400">
                  {theStimsMeta.description}&nbsp;
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 ml-auto">
          <Button
            className="ml-auto"
            tooltipText=".stims.json, .assay.json, or .mp4"
            onClick={() => {
              window.electron.send('loadFile');
              setActiveTab('Stims');
            }}
          >
            Load
          </Button>
          <Button
            className="ml-auto"
            onClick={() => {
              const stimsAssay = newAssay({
                assayType: AssayType.SqrGratingPairs,
              });
              setTheStimsSpec(stimsAssay);
              setTheStimsMeta({});
              setActiveTab('Assay');
            }}
          >
            New Assay
          </Button>{' '}
        </div>
      </div>

      {(theStimsSpec || theStimSequence) && (
        <>
          <div className="flex items-center shrink-0 border-b border-gray-700">
            <div className="flex">
              {tabLabels.map((tabLabel) => (
                <button
                  key={tabLabel}
                  className={`px-3 py-2 text-center cursor-pointer transition-colors duration-300 text-xl
          ${activeTab === tabLabel ? 'border-b-2 border-blue-700 text-blue-500' : 'text-gray-400 hover:text-gray-500'}`}
                  onClick={() => setActiveTab(tabLabel)}
                >
                  {tabLabel}
                </button>
              ))}
            </div>
            <Button
              className="ml-auto"
              onClick={async () => {
                const title = theStimsMeta?.title || 'untitled';
                const filePath = await saveFileDialogAsync(title + '.stims.json');
                await theStimSequence?.saveStimsAsync(
                  filePath,
                  title,
                  theStimsMeta?.description,
                  theStimsMeta?.fromVideoComment
                );
              }}
            >
              Save Stims
            </Button>
          </div>
          {activeTab === 'Assay' && <AssayTab />}
          {activeTab === 'Stims' && <StimsTab />}
          {activeTab === 'Build' && <BuildTab />}
          {activeTab === 'Run' && <RunTab />}
        </>
      )}
    </div>
  );
}
