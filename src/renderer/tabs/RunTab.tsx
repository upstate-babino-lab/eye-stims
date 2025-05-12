/*
import DynamicForm, { FieldConfig } from './components/DynamicForm';

const formConfig: FieldConfig[] = [
  { name: 'lab', type: 'text', required: true },
  { name: 'gender', type: 'radio', options: ['Male', 'Female'], required: true },
  {
    name: 'species',
    type: 'select',
    options: ['Mouse', 'Rat', 'Guinea Pig'],
    required: true,
  },
  { name: 'birthdate', type: 'date' },
  { name: 'orientation', type: 'number', min: -359, max: 359 },
];
*/

export default function RunTab() {
  /*
  const handleFormSubmit = (data: Record<string, unknown>) => {
    console.log('Form submitted:', data);
  };
*/
  return (
    <div className="flex flex-col items-center p-4 gap-6">
      <div className="text-2xl">Placeholder...</div>
      <div className="">
        For now, simply open your saved .mp4 file in any video player.
      </div>
      <div className="">
        <a
          target="_blank"
          className="underline text-blue-700"
          href="https://github.com/upstate-babino-lab/eye-stims/issues/10"
          rel="noreferrer"
        >
          Remote control
        </a>{' '}
        is planned
      </div>

      {/*}
      <DynamicForm
        config={formConfig}
        onSubmit={handleFormSubmit}
        labelClassName="min-w-100 flex-shrink-0 p-4 text-gray-400 font-medium"
        inputClassName=" border border-gray-500 rounded-md px-2 py-1"
      />
      */}
    </div>
  );
}
