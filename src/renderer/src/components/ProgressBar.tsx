import React from 'react';

type ProgressBarProps = {
  progress: number; // Value between 0 and 100
  height?: string; // Tailwind height class, e.g., "h-4"
  color?: string; // Tailwind background color class, e.g., "bg-blue-500"
  backgroundColor?: string; // Tailwind background color class for the track
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'h-4',
  color = 'bg-green-500',
  backgroundColor = 'bg-gray-400',
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0.2), 100);

  return (
    <div
      className={`w-full ${backgroundColor} rounded-sm overflow-hidden ${height}`}
    >
      <div
        className={`${color} h-full transition-all duration-300`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
