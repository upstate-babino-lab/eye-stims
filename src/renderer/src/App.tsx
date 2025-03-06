import { useState } from 'react'

const tabs = ['Sequence', 'Preview', 'Start'] // Tab labels

export default function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState('Home')

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`flex-1 p-3 text-center transition-colors duration-300 ${
                activeTab === tab ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 text-center text-lg">
          {activeTab === 'Sequence' && <p>Load sequence. Export video</p>}
          {activeTab === 'Preview' && <p>Preview a stimulus</p>}
          {activeTab === 'Start' && <p>Start running the sequence</p>}
        </div>
      </div>
    </div>
  )
}
