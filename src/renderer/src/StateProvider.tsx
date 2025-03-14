// Provides state accessible to all components in the App
import { useEffect, useState, ReactNode } from 'react';
import { StateContext } from './StateContext';
import StimSequence from './stim-sequence';

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
      /*
      const numberedLines = stimulusList
        .map((object, index) => `${index + 1}: ${JSON.stringify(object)}`) // Add line numbers
        .join('\n'); // Join into a single string with newlines

      (document.getElementById('file-content') as HTMLTextAreaElement).value =
        numberedLines;
        */
      const fileNameWithExtension = filePath.split('/').pop() || '';
      const name = (parsedContents && parsedContents['name']) || fileNameWithExtension;
      const description = (parsedContents && parsedContents['description']) ?? ""
      setTheStimSequence(new StimSequence(name, description, stimulusList));
    };

    const handleSaveRequest = (filePath: string): void => {
      console.log(
        `>>>>> renderer StateProvider got 'request-file-to-save' from main`
      );
      const content = (
        document.getElementById('file-content') as HTMLTextAreaElement
      ).value;
      window.electron.send('save-file', { filePath: filePath, content: content });
    };

    // Listen for messages from main process
    window.electron.on('file-loaded', handleFileLoaded);
    window.electron.on('request-file-to-save', handleSaveRequest);

    // Clean up listener when component unmounts
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
  const capitalize = (str: string) => {
    if (!str) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return old.stimulus_list.map((oldItem) => {
    const oldStim = oldItem.stimulus;
    const newStim = {
      name: capitalize(oldStim.stimulusType),
      duration: oldStim.lifespan,
      bgColor: oldStim.backgroundColor,
    };
    return newStim;
  });
}
