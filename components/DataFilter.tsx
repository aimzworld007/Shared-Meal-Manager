/**
 * @file DataFilter.tsx
 * @summary A component that allows users to filter data based on a date range, purchaser, and price.
 */
import React from 'react';
import { Participant } from '../types';

interface DataFilterProps {
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  selectedPurchaser: string;
  members: Participant[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onMinAmountChange: (amount: string) => void;
  onMaxAmountChange: (amount: string) => void;
  onPurchaserChange: (purchaserId: string) => void;
  onReset: () => void;
}

const DataFilter: React.FC<DataFilterProps> = ({
  startDate,
  endDate,
  minAmount,
  maxAmount,
  selectedPurchaser,
  members,
  onStartDateChange,
  onEndDateChange,
  onMinAmountChange,
  onMaxAmountChange,
  onPurchaserChange,
  onReset
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Filter Data</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
        {/* Date Filters */}
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
          />
        </div>

        {/* Amount Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="min-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Amount</label>
            <input
              type="number"
              id="min-amount"
              value={minAmount}
              onChange={(e) => onMinAmountChange(e.target.value)}
              placeholder="e.g., 10"
              className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
            />
          </div>
          <div>
            <label htmlFor="max-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Amount</label>
            <input
              type="number"
              id="max-amount"
              value={maxAmount}
              onChange={(e) => onMaxAmountChange(e.target.value)}
              placeholder="e.g., 100"
              className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Purchaser Filter */}
        <div>
          <label htmlFor="purchaser-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purchased By</label>
          <select
            id="purchaser-filter"
            value={selectedPurchaser}
            onChange={(e) => onPurchaserChange(e.target.value)}
            className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all appearance-none cursor-pointer"
          >
            <option value="">All Members</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center px-4 py-2.5 border-2 border-slate-200 dark:border-slate-700 text-sm font-bold rounded-xl shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95 hover:border-slate-300 dark:hover:border-slate-600 w-full h-11"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default DataFilter;