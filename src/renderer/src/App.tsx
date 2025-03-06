import { useState } from 'react'

const tabs = ['Home', 'About', 'Contact'] // Tab labels

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
          {activeTab === 'Home' && <p>Welcome to the Home Page!</p>}
          {activeTab === 'About' && <p>Learn more About Us here.</p>}
          {activeTab === 'Contact' && <p>Get in touch with us on the Contact Page.</p>}
        </div>
      </div>
    </div>
  )
}
