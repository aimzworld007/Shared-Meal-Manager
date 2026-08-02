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
    <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center h-52 transition-all hover:shadow-md group">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold ${colorClassName} p-2 shadow-inner group-hover:scale-105 transition-transform duration-300`}>
        {/* Use a span to prevent long numbers from breaking the circle */}
        <span className="truncate">{numericValue}</span>
      </div>
       <h3 className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{title}</h3>
    </div>
  );
};

export default SummaryCircle;