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
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center justify-center text-center h-48">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold ${colorClassName}`}>
        {value.split(' ')[0]}
      </div>
       <p className="mt-3 text-2xl font-semibold text-gray-800">{value}</p>
       <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
    </div>
  );
};


// A different visual style, keeping it in case we want to switch
const SummaryCircleV2: React.FC<SummaryCircleProps> = ({ title, value, colorClassName }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center justify-center text-center">
       <h3 className="text-sm font-medium text-gray-500 truncate mb-2">{title}</h3>
       <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${colorClassName.replace('bg-', 'border-')}`}>
           <span className="text-2xl font-bold text-gray-800">{value}</span>
       </div>
    </div>
  );
};


export default SummaryCircle;
