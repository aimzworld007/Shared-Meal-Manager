/**
 * @file GroceryManager.tsx
 * @summary Component for adding, viewing, and deleting grocery expenses for all members.
 */
import React, { useState } from 'react';
import { GroceryItem, Participant, Period } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

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
  const { currency } = useAuth();
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
    <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden transition-all hover:shadow-md">
      <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Grocery bill Month Of {props.activePeriod?.name}
          </h3>
           <button onClick={props.onNavigateToAccounts} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors mt-1">
            Show More in Balance Tab
          </button>
        </div>
        <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsFilterVisible(!isFilterVisible)} 
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-full shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-95"
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
        <div id="filter-panel" className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="start-date"
                    value={props.startDate}
                    onChange={(e) => props.onStartDateChange(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
                  />
              </div>
               <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    id="end-date"
                    value={props.endDate}
                    onChange={(e) => props.onEndDateChange(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
                  />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="min-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Amt</label>
                    <input
                      type="number"
                      id="min-amount"
                      value={props.minAmount}
                      onChange={(e) => props.onMinAmountChange(e.target.value)}
                      placeholder="e.g., 10"
                      className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Max Amt</label>
                    <input
                      type="number"
                      id="max-amount"
                      value={props.maxAmount}
                      onChange={(e) => props.onMaxAmountChange(e.target.value)}
                      placeholder="e.g., 100"
                      className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all"
                    />
                  </div>
              </div>
              <div>
                  <label htmlFor="purchaser-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purchased By</label>
                  <select
                    id="purchaser-filter"
                    value={props.selectedPurchaser}
                    onChange={(e) => props.onPurchaserChange(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all appearance-none"
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
                    className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all active:scale-95"
                  >
                    Reset Filters
                  </button>
              </div>
           </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">By</th>
              <th scope="col" className="px-4 sm:px-8 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
              {isEditModeEnabled && <th scope="col" className="relative px-4 sm:px-8 py-4"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
            {props.groceries.length === 0 && (
              <tr><td colSpan={isEditModeEnabled ? 5 : 4} className="px-4 sm:px-8 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No expenses found for the selected filters.</td></tr>
            )}
            {props.groceries.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{formatDateShort(item.date)}</td>
                <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.name}</td>
                <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{item.purchaserName}</td>
                <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(item.amount, currency)}</td>
                {isEditModeEnabled && (
                    <td className="px-4 sm:px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => props.onEditGrocery(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors active:scale-95" title="Edit Expense" aria-label="Edit Expense">
                               <EditIcon />
                            </button>
                            <button onClick={() => handleDeleteClick(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-full dark:text-red-400 dark:hover:bg-red-900/30 transition-colors active:scale-95" title="Delete Expense" aria-label="Delete Expense">
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

       <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                Total Grocery Amount: <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(totalGroceryCost, currency)}</span>
            </p>
            {props.members.length > 0 && (
                <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
                    {props.members.length} Person Average: <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(props.averageExpense, currency)}</span>
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