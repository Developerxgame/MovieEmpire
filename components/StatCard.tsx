import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, colorClass }) => {
  return (
    <div className="bg-zinc-800 p-4 rounded-2xl flex items-center shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-zinc-700 hover:shadow-amber-500/10">
      <div className={`p-2 rounded-full mr-4 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;