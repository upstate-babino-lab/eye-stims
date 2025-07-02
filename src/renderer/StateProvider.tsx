// Provides state accessible to all components in the App
import { useEffect, useState, ReactNode } from 'react';
import { StateContext, StimsMeta } from './StateContext';
import StimSequence from './StimSequence';
import { Stimulus } from '@stims/index';
import { StimsSpec, newStimSpec } from '@specs/index';

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
        setTheStimsSpec(null);
        stims = parsedContents['stimuli'] as Stimulus[]; // POJOs
      }
      const stimSequence = new StimSequence(stims);
      setTheStimSequence(stimSequence);

      setTheStimsMeta({
        loadedPath: filePath,
        title:
          parsedContents['title'] ||
          parsedContents['name'] || // For backward compatibility
          fileNameWithExtension,
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
      const content = JSON.stringify(theStimsSpec);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
