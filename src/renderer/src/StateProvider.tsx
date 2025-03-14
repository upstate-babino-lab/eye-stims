// Provides state accessible to all components in the App
import { useEffect, useState, ReactNode } from 'react';
import { StateContext } from './StateContext';
import StimSequence from './stim-sequence';

export function StateProvider({ children }: { children: ReactNode }) {
  const [sharedState, setSharedState] = useState<StimSequence>(
    new StimSequence('foobar')
  );

  useEffect(() => {
    const handleFileLoaded = (parsedContents: unknown): void => {
      console.log(`>>>>> renderer StateProvider got 'file-loaded' from main`);
      const stimulusList = oldStimList2New(parsedContents) ?? parsedContents;
      /*
      const numberedLines = stimulusList
        .map((object, index) => `${index + 1}: ${JSON.stringify(object)}`) // Add line numbers
        .join('\n'); // Join into a single string with newlines

      (document.getElementById('file-content') as HTMLTextAreaElement).value =
        numberedLines;
        */
      setSharedState(new StimSequence('newName', 'blah blah', stimulusList));
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
    <StateContext.Provider value={{ sharedState, setSharedState }}>
      {children}
    </StateContext.Provider>
  );
}

function capitalize(str: string): string {
  if (!str) {
    return str; // Return empty string or null/undefined as is
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function oldStimList2New(old) {
  if (!old || !old.stimulus_list) {
    return null;
  }
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
