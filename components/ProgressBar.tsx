import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-zinc-300">{label}</span>
        <span className="text-sm font-semibold text-amber-400">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-2">
        <div
          className="bg-amber-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;