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
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <h3 className="text-lg font-medium text-gray-800">Filter Data</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Date Filters */}
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Amount Filters */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="min-amount" className="block text-sm font-medium text-gray-700">Min Amount</label>
            <input
              type="number"
              id="min-amount"
              value={minAmount}
              onChange={(e) => onMinAmountChange(e.target.value)}
              placeholder="e.g., 10"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="max-amount" className="block text-sm font-medium text-gray-700">Max Amount</label>
            <input
              type="number"
              id="max-amount"
              value={maxAmount}
              onChange={(e) => onMaxAmountChange(e.target.value)}
              placeholder="e.g., 100"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Purchaser Filter */}
        <div>
          <label htmlFor="purchaser-filter" className="block text-sm font-medium text-gray-700">Purchased By</label>
          <select
            id="purchaser-filter"
            value={selectedPurchaser}
            onChange={(e) => onPurchaserChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 w-full"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default DataFilter;