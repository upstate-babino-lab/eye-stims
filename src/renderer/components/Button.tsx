import React from 'react';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const BUTTON_STYLES =
  'text-sm bg-blue-500 text-gray-200 w-fit px-4 py-0.5 rounded ' +
  'cursor-pointer hover:bg-blue-600 active:bg-blue-800 ' +
  'focus:outline-none focus:shadow-outline ';

const Button: React.FC<ButtonProps> = ({ className, children, onClick }) => {
  return (
    <button
      className={BUTTON_STYLES + ' ' + className}
      //className="bg-blue-500 text-white px-4 py-0.5 rounded shadow-md hover:shadow-lg transition-shadow duration-300"

      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
