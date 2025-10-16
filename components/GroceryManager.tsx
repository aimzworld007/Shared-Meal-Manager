/**
 * @file GroceryManager.tsx
 * @summary Component for adding, viewing, and deleting grocery expenses for all members.
 */
import React, { useState } from 'react';
import { GroceryItem, Participant } from '../types';
import Modal from './Modal';
import ConfirmationModal from './ConfirmationModal';
import DataFilter from './DateFilter';

interface GroceryManagerProps {
  groceries: GroceryItem[];
  members: Participant[];
  onEditGrocery: (item: GroceryItem) => void;
  onDeleteGrocery: (item: GroceryItem) => Promise<void>;
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V19l-4 2v-5.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const GroceryManager: React.FC<GroceryManagerProps> = (props) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GroceryItem | null>(null);
  
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
  
  const totalGroceryCost = props.groceries.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Grocery Bill</h3>
          <p className="text-2xl font-semibold text-indigo-600">{formatCurrency(totalGroceryCost)}</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsFilterModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                <FilterIcon />
                Filter
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchased By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {props.groceries.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No expenses recorded for the selected period.</td></tr>
            )}
            {props.groceries.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.purchaserName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{formatCurrency(item.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                   <button onClick={() => props.onEditGrocery(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                   <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
      />
      
      <Modal title="Filter Expenses" isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
        <DataFilter 
          startDate={props.startDate}
          endDate={props.endDate}
          minAmount={props.minAmount}
          maxAmount={props.maxAmount}
          selectedPurchaser={props.selectedPurchaser}
          members={props.members}
          onStartDateChange={props.onStartDateChange}
          onEndDateChange={props.onEndDateChange}
          onMinAmountChange={props.onMinAmountChange}
          onMaxAmountChange={props.onMaxAmountChange}
          onPurchaserChange={props.onPurchaserChange}
          onReset={() => {
            props.onResetFilters();
            setIsFilterModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default GroceryManager;
