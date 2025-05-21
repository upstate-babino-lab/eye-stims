// Provides state accessible to all components in the App
import { useEffect, useState, ReactNode } from 'react';
import { StateContext } from './StateContext';
import StimSequence from './StimSequence';
import { Stimulus } from '@stims/index';
import { StimsSpec } from '@specs/StimsSpec';

export function StateProvider({ children }: { children: ReactNode }) {
  const [theStimSequence, setTheStimSequence] = useState<StimSequence | null>(
    null
  );

  useEffect(() => {
    const handleFileLoaded = (filePath: string, parsedContents: unknown): void => {
      console.log(`>>>>> renderer StateProvider got 'file-loaded' from main`);
      const fileNameWithExtension = filePath.split('/').pop() || '';
      let stimPojos: Stimulus[] = [];
      let stimsSpec: StimsSpec | null = null;

      if (!parsedContents) {
        throw new Error('No parsed contents from ' + filePath);
      }
      if (filePath.endsWith('.spec.json')) {
        stimsSpec = new StimsSpec(parsedContents as Partial<StimsSpec>);
        stimPojos = stimsSpec.stimuli();
      } else {
        stimPojos = parsedContents['stimuli'] as Stimulus[];
      }
      const name = parsedContents['name'] || fileNameWithExtension;
      const description = parsedContents['description'] ?? '';
      setTheStimSequence(new StimSequence(filePath, name, description, stimPojos));
    };

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
    window.electron.on('request-file-to-save', handleSaveRequest);

    // Clean up listeners when component unmounts
    return () => {
      window.electron.removeListener('file-loaded', handleFileLoaded);
      window.electron.removeListener('request-file-to-save', handleFileLoaded);
    };
  }, []);

  return (
    <StateContext.Provider
      value={{
        theStimSequence: theStimSequence,
        setTheStimSequence: setTheStimSequence,
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
