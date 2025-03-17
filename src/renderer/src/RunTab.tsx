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

export default function RunTab() {
  const handleFormSubmit = (data: Record<string, unknown>) => {
    console.log('Form submitted:', data);
  };

  return (
    <div className="p-10 w-600">
      <DynamicForm
        config={formConfig}
        onSubmit={handleFormSubmit}
        labelClassName="min-w-100 flex-shrink-0 p-4 text-gray-400 font-medium"
        inputClassName=" border border-gray-500 rounded-md px-2 py-1"
      />
    </div>
  );
}
