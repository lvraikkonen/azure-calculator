import React from 'react';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ 
  suggestions, 
  onSuggestionClick 
}) => {
  if (!suggestions || suggestions.length === 0) return null;
  
  return (
    <div className="mt-4">
      <p className="text-sm text-gray-500 mb-2">你可能想问：</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm py-1 px-3 rounded-full"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;