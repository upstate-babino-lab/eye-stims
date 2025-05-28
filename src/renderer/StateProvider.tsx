// Provides state accessible to all components in the App
import { useEffect, useState, ReactNode } from 'react';
import { StateContext, StimsMeta } from './StateContext';
import StimSequence from './StimSequence';
import { Stimulus } from '@stims/index';
import { newStimSpec, StimsSpec } from '@specs/StimsSpec';

export function StateProvider({ children }: { children: ReactNode }) {
  const [theStimsMeta, setTheStimsMeta] = useState<StimsMeta | null>(null);
  const [theStimsSpec, setTheStimsSpec] = useState<StimsSpec | null>(null);
  const [theStimSequence, setTheStimSequence] = useState<StimSequence | null>(
    null
  );

  useEffect(() => {
    const handleFileLoaded = (filePath: string, parsedContents: unknown): void => {
      console.log(`>>>>> renderer StateProvider got 'file-loaded' from main`);
      const fileNameWithExtension = filePath.split('/').pop() || '';
      let stims: Stimulus[] = [];
      let stimsSpec: StimsSpec | null = null;

      if (!parsedContents) {
        throw new Error('No parsed contents from ' + filePath);
      }
      if (filePath.endsWith('.spec.json')) {
        stimsSpec = newStimSpec(parsedContents as StimsSpec);
        setTheStimsSpec(stimsSpec);
        stims = stimsSpec.stimuli(); // Not POJOs
      } else {
        stims = parsedContents['stimuli'] as Stimulus[]; // POJOs
      }
      const stimSequence = new StimSequence(stims);
      setTheStimSequence(stimSequence);

      setTheStimsMeta({
        loadedPath: filePath,
        name: parsedContents['name'] || fileNameWithExtension,
        description: parsedContents['description'] ?? '',
        count: stimSequence?.stimuli.length,
        totalDurationMS: stimSequence?.duration(),
      });
    };

    // TODO: remove because not used?
    const handleSaveRequest = (filePath: string): void => {
      console.log(
        `>>>>> renderer StateProvider got 'request-file-to-save' from main. Will save HTML 'file-content'`
      );
      const content = (
        document.getElementById('file-content') as HTMLTextAreaElement
      ).value;
      window.electron.send('saveFile', { filePath: filePath, content: content });
    };

    // Listen for messages from main process
    window.electron.on('file-loaded', handleFileLoaded);
    window.electron.on('request-file-to-save', handleSaveRequest); // TODO: remove because not used?

    // Clean up listeners when component unmounts
    return () => {
      window.electron.removeListener('file-loaded', handleFileLoaded);
      window.electron.removeListener('request-file-to-save', handleFileLoaded);
    };
  }, []);

  return (
    <StateContext.Provider
      value={{
        theStimsMeta: theStimsMeta,
        setTheStimsMeta: setTheStimsMeta,
        theStimSequence: theStimSequence,
        setTheStimSequence: setTheStimSequence,
        theStimsSpec: theStimsSpec,
        setTheStimsSpec: setTheStimsSpec,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

/*
function oldStimList2New(old) {
  if (!old || !old.stimulus_list) {
    return null;
  }

  return old.stimulus_list.map((oldItem) => {
    const oldStim = oldItem.stimulus;
    let name = capitalize(oldStim.stimulusType);
    if (name === 'Wait') {
      name = 'Solid'; // TODO: Are these really the same?
    }
    const newStim = {
      name: name,
      duration: oldStim.lifespan,
      bgColor: oldStim.backgroundColor,
    };
    return newStim;
  });
}
*/
