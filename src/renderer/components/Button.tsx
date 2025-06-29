import React from 'react';
import { Tooltip } from 'react-tooltip';
import { TOOLTIP_STYLES } from '../render-utils';
import 'react-tooltip/dist/react-tooltip.css';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  tooltipText?: string;
  onClick?: () => void;
}

export const BUTTON_STYLES =
  'text-sm bg-blue-500 text-gray-200 w-fit px-4 py-0.5 rounded ' +
  'cursor-pointer hover:bg-blue-600 active:bg-blue-800 ' +
  'focus:outline-none focus:shadow-outline ';

const Button: React.FC<ButtonProps> = ({
  className,
  children,
  tooltipText: tooltip,
  onClick,
}) => {
  const generatedTooltipId = `button-tooltip-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <>
      <button
        className={BUTTON_STYLES + ' ' + className}
        //className="bg-blue-500 text-white px-4 py-0.5 rounded shadow-md hover:shadow-lg transition-shadow duration-300"

        onClick={onClick}
        data-tooltip-id={generatedTooltipId} // Link button to tooltip
        data-tooltip-content={tooltip} // Content directly on the button (simpler API)
      >
        {children}
      </button>
      {tooltip && <Tooltip id={generatedTooltipId} className={TOOLTIP_STYLES} />}
    </>
  );
};

export default Button;
