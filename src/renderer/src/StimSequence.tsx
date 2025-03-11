import Button from './components/Button';

function sendLoadFile() {
  window.electron.ipcRenderer.send('load-file');
}

export default function StimSequence() {
  return (
    <div className="flex flex-col h-[82vh]">
      <div className="text-right p-2">
        <Button onClick={sendLoadFile}>Load Sequence</Button>
      </div>
      <textarea id="file-content" className="w-full h-full bg-gray-500" />
    </div>
  );
}
