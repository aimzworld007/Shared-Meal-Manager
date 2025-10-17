/**
 * @file GroceryManager.tsx
 * @summary Component for adding, viewing, and deleting grocery expenses for all members.
 */
import React, { useState } from 'react';
import { GroceryItem, Participant, Period } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { formatCurrency } from '../utils/formatters';

interface GroceryManagerProps {
  groceries: GroceryItem[];
  members: Participant[];
  activePeriod: Period | null;
  onEditGrocery: (item: GroceryItem) => void;
  onDeleteGrocery: (item: GroceryItem) => Promise<void>;
  onNavigateToAccounts: () => void;
  averageExpense: number;
  // Filter props
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  selectedPurchaser: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onMinAmountChange: (amount: string) => void;
  onMaxAmountChange: (amount: string) => void;
  onPurchaserChange: (purchaserId: string) => void;
  onResetFilters: () => void;
}

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V19l-4 2v-5.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const EditIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const DeleteIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const GroceryManager: React.FC<GroceryManagerProps> = (props) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GroceryItem | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isEditModeEnabled, setIsEditModeEnabled] = useState(false);
  
  const handleDeleteClick = (item: GroceryItem) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await props.onDeleteGrocery(itemToDelete);
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleResetFilters = () => {
    props.onResetFilters();
    setIsFilterVisible(false);
  };

  const formatDateShort = (isoDate: string) => {
      // Create date in UTC to avoid timezone shifts when parsing YYYY-MM-DD
      const date = new Date(`${isoDate}T00:00:00Z`);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).replace(' ', '-');
  };
  
  const totalGroceryCost = props.groceries.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 rounded-t-lg flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Grocery bill Month Of {props.activePeriod?.name}
          </h3>
           <button onClick={props.onNavigateToAccounts} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
            Show More in Balance Tab
          </button>
        </div>
        <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFilterVisible(!isFilterVisible)} 
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              aria-expanded={isFilterVisible}
              aria-controls="filter-panel"
            >
                <FilterIcon />
                {isFilterVisible ? 'Hide' : 'Filter'}
            </button>
            <label htmlFor="edit-toggle" className="flex items-center cursor-pointer">
                <span className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">Edit</span>
                <div className="relative">
                    <input
                        id="edit-toggle"
                        type="checkbox"
                        className="sr-only"
                        checked={isEditModeEnabled}
                        onChange={() => setIsEditModeEnabled(!isEditModeEnabled)}
                    />
                    <div className={`block w-12 h-6 rounded-full transition ${isEditModeEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isEditModeEnabled ? 'translate-x-6' : ''}`}></div>
                </div>
            </label>
        </div>
      </div>

      {isFilterVisible && (
        <div id="filter-panel" className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <input
                    type="date"
                    id="start-date"
                    value={props.startDate}
                    onChange={(e) => props.onStartDateChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
              </div>
               <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                  <input
                    type="date"
                    id="end-date"
                    value={props.endDate}
                    onChange={(e) => props.onEndDateChange(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="min-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Min Amt</label>
                    <input
                      type="number"
                      id="min-amount"
                      value={props.minAmount}
                      onChange={(e) => props.onMinAmountChange(e.target.value)}
                      placeholder="e.g., 10"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Amt</label>
                    <input
                      type="number"
                      id="max-amount"
                      value={props.maxAmount}
                      onChange={(e) => props.onMaxAmountChange(e.target.value)}
                      placeholder="e.g., 100"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
              </div>
              <div>
                  <label htmlFor="purchaser-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purchased By</label>
                  <select
                    id="purchaser-filter"
                    value={props.selectedPurchaser}
                    onChange={(e) => props.onPurchaserChange(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Members</option>
                    {props.members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
              </div>
               <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Reset Filters
                  </button>
              </div>
           </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">By</th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              {isEditModeEnabled && <th scope="col" className="relative px-2 sm:px-6 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {props.groceries.length === 0 && (
              <tr><td colSpan={isEditModeEnabled ? 5 : 4} className="px-2 sm:px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No expenses found for the selected filters.</td></tr>
            )}
            {props.groceries.map((item) => (
              <tr key={item.id}>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatDateShort(item.date)}</td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{item.purchaserName}</td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(item.amount)}</td>
                {isEditModeEnabled && (
                    <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <div className="flex items-center justify-end space-x-4">
                            <button onClick={() => props.onEditGrocery(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Edit Expense" aria-label="Edit Expense">
                               <EditIcon />
                            </button>
                            <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete Expense" aria-label="Delete Expense">
                               <DeleteIcon />
                            </button>
                       </div>
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 rounded-b-lg text-center space-y-1">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                Total Grocery Amount: <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(totalGroceryCost)}</span>
            </p>
            {props.members.length > 0 && (
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {props.members.length} Person Average: <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(props.averageExpense)}</span>
                </p>
            )}
        </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </div>
  );
};

export default GroceryManager;