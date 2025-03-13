import { useEffect } from 'react';
import Button from './components/Button';

export default function StimSequence() {
  useEffect(() => {
    const handleFileLoaded = (parsedContents: unknown): void => {
      console.log(`>>>>> renderer got 'file-loaded'`);
      const stimulusList = oldStimList2New(parsedContents) ?? parsedContents;
      const numberedLines = stimulusList
        .map((object, index) => `${index + 1}: ${JSON.stringify(object)}`) // Add line numbers
        .join('\n'); // Join into a single string with newlines

      (document.getElementById('file-content') as HTMLTextAreaElement).value =
        numberedLines;
    };

    const handleSaveRequest = (filePath: string): void => {
      console.log(`>>>>> renderer got 'request-file-to-save'`);
      const content = (
        document.getElementById('file-content') as HTMLTextAreaElement
      ).value;
      window.electron.send('save-file', { filePath: filePath, content: content });
    }

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
    <div className="flex flex-col h-[82vh]">
      <div className="text-right p-2">
        <Button onClick={() => window.electron.send('load-file')}>
          Load Sequence
        </Button>
      </div>
      <textarea id="file-content" className="w-full h-full bg-gray-500" />
    </div>
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
