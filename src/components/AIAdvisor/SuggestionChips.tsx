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
    <div className="mt-3">
      <p className="text-sm text-gray-500 mb-2 font-medium">您可能想问：</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-sm py-1.5 px-3 rounded-full transition-colors shadow-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;
