import React, { ReactNode } from 'react';
import RecommendationCard from './RecommendationCard';
import SuggestionChips from './SuggestionChips';
import { AzureSolution } from '../../types';

interface AIMessageProps {
  children: ReactNode;
  isStreaming?: boolean;
  recommendation?: AzureSolution | null;
  suggestions?: string[];
  applySolution?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
}

const AIMessage: React.FC<AIMessageProps> = ({ 
  children, 
  isStreaming = false,
  recommendation = null,
  suggestions = [],
  applySolution,
  onSuggestionClick
}) => {
  return (
    <div className="flex items-start">
      <div className={`bg-blue-100 rounded-lg rounded-tl-none p-3 max-w-3/4 text-gray-800 ${
        isStreaming ? 'border-l-4 border-blue-400 animate-pulse' : ''
      }`}>
        {children}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-600 animate-blink">
            |
          </span>
        )}
        
        {/* 如果有推荐方案，显示推荐卡片 */}
        {recommendation && !isStreaming && (
          <div className="mt-3">
            <RecommendationCard 
              recommendation={recommendation} 
              onApply={applySolution || (() => {})}
            />
          </div>
        )}
        
        {/* 如果有建议问题，显示建议列表 */}
        {suggestions && suggestions.length > 0 && !isStreaming && (
          <div className="mt-3">
            <SuggestionChips 
              suggestions={suggestions} 
              onSuggestionClick={onSuggestionClick || (() => {})}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMessage;