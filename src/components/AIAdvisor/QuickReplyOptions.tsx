import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface QuickReplyOptionsProps {
  options: Option[];
  onSelect: (value: any) => void;
  label: string;
}

const QuickReplyOptions: React.FC<QuickReplyOptionsProps> = ({ 
  options, 
  onSelect, 
  label 
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="text-sm text-gray-500 ml-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button 
            key={option.value}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-full text-sm"
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplyOptions;