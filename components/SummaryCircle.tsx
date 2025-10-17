/**
 * @file SummaryCircle.tsx
 * @summary A reusable component to display a single key statistic in a circle.
 */
import React from 'react';

interface SummaryCircleProps {
  title: string;
  value: string;
  colorClassName: string;
}

const SummaryCircle: React.FC<SummaryCircleProps> = ({ title, value, colorClassName }) => {
  // Extracts the numeric part from a string (e.g., "AED 1,234.50" -> "1,234.50", "12" -> "12")
  const numericValue = value.replace(/[^0-9.,-]+/g, "");

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col items-center justify-center text-center h-48">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold ${colorClassName} p-2`}>
        {/* Use a span to prevent long numbers from breaking the circle */}
        <span className="truncate">{numericValue}</span>
      </div>
       <p className="mt-3 text-2xl font-semibold text-gray-800 dark:text-gray-200">{value}</p>
       <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
    </div>
  );
};

export default SummaryCircle;
