import React from 'react';

interface HubIconButtonProps {
  label: string;
  icon: React.ReactNode; // We can pass SVG icons as children
  onClick?: () => void;
  isDisabled?: boolean;
}

const HubIconButton: React.FC<HubIconButtonProps> = ({ label, icon, onClick, isDisabled = false }) => {
  const classes = isDisabled
    ? "bg-gray-800 opacity-50 cursor-not-allowed"
    : "bg-gray-800 hover:bg-gray-700 cursor-pointer";

  return (
    <div onClick={!isDisabled ? onClick : undefined} className={`w-48 h-20 flex items-center p-4 rounded-lg border-2 border-gray-700 shadow-md transition-colors ${classes}`}>
      <div className="w-12 h-12 mr-4 text-purple-400">
        {icon}
      </div>
      <span className="font-bold text-lg text-white">{label}</span>
    </div>
  );
};

export default HubIconButton;
