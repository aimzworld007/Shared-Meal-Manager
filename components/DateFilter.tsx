/**
 * @file DateFilter.tsx
 * @summary A component that allows users to filter data based on a date range.
 */
import React from 'react';

interface DateFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ startDate, endDate, onStartDateChange, onEndDateChange, onReset }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-wrap items-end gap-4">
      <h3 className="text-lg font-medium text-gray-800 w-full sm:w-auto">Filter by Date</h3>
      <div className="flex-grow">
        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="flex-grow">
        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
        <button
        onClick={onReset}
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
      >
        Reset
      </button>
    </div>
  );
};

export default DateFilter;
