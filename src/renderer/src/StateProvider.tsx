// Provides state accessible to all components in the App
import { useEffect, useState, ReactNode } from 'react';
import { StateContext } from './StateContext';
import StimSequence from './StimSequence';
import { newStimulus } from './Stimulus';
import { capitalize } from './utilities';

export function StateProvider({ children }: { children: ReactNode }) {
  const [theStimSequence, setTheStimSequence] = useState<StimSequence | null>(
    null
  );

  useEffect(() => {
    const handleFileLoaded = (filePath: string, parsedContents: unknown): void => {
      console.log(`>>>>> renderer StateProvider got 'file-loaded' from main`);
      const stimulusList =
        oldStimList2New(parsedContents) ??
        (parsedContents && parsedContents['stimuli']);
      const fileNameWithExtension = filePath.split('/').pop() || '';
      const name =
        (parsedContents && parsedContents['name']) || fileNameWithExtension;
      const description = (parsedContents && parsedContents['description']) ?? '';
      // TODO: Instead of passing in a newStimulus for each, re-use the same object for duplicates
      setTheStimSequence(
        new StimSequence(
          getBasenameFromString(filePath),
          name,
          description,
          stimulusList.map((s) => newStimulus(s))
        )
      );
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

function getBasenameFromString(filePath: string): string {
  const baseNameIncludingExtension = filePath.split(/[/\\]/).pop() || '';
  return baseNameIncludingExtension.replace(/\.[^/.]+$/, '');
}
