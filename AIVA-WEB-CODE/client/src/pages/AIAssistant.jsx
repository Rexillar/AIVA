import Card from '../components/shared/Card';
import React from 'react';
const AIAssistant = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Assistant</h1>
      <Card className="p-6">
        <p className="text-gray-600 dark:text-gray-400">
          AI Assistant feature coming soon! This will provide personal AI mentoring,
          automated prioritization, and context-aware suggestions.
        </p>
      </Card>
    </div>
  );
};

export default AIAssistant;