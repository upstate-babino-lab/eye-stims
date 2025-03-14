import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

//  className="text-sm inline-flex items-center px-2 py-0.5 cursor-pointer rounded bg-green-800 hover:bg-green-700 active:bg-green-600"

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      className={
        'text-sm bg-blue-500 text-white w-fit px-4 py-0.5 rounded ' +
        'cursor-pointer hover:bg-blue-600 active:bg-blue-800'
      }
      //className="bg-blue-500 text-white px-4 py-0.5 rounded shadow-md hover:shadow-lg transition-shadow duration-300"

      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
