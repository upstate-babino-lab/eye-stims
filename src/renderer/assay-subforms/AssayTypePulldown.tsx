import { AssayType } from '@src/assays';
import { useState, useRef, useEffect } from 'react';

// Custom dropdown component from Gemini, because native select was hard to style

export function AssayTypePulldown(props: {
  initialValue: AssayType;
  onChange: (value: AssayType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(props.initialValue);
  const dropdownRef = useRef<HTMLDivElement>(null); // 1. Create a ref

  const handleSelect = (value: AssayType) => {
    setSelectedValue(value);
    props.onChange(value);
    setIsOpen(false);
  };

  // 2. Use useEffect to handle the "click outside" logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 3. Check if the click occurred outside the dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // 4. Add the event listener when the dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // 5. Clean up the event listener when the component unmounts or isOpen changes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); // Re-run this effect when isOpen state changes

  return (
    // 6. Attach the ref to the top-level container
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={
            'inline-flex justify-center w-full rounded-md shadow-sm px-4 py-2 ' +
            'hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500'
          }
        >
          {selectedValue}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className={
            'origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ' +
            'ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none'
          }
        >
          <div className="py-1">
            {Object.keys(AssayType).map((key) => {
              const value = AssayType[key as keyof typeof AssayType];
              return (
                <div
                  key={key}
                  onClick={() => handleSelect(value)}
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-500 hover:text-gray-100 cursor-pointer"
                >
                  {key}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
