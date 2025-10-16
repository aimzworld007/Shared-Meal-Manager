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
  onAddGrocery: (item: Omit<GroceryItem, 'id'>) => Promise<void>;
  onDeleteGrocery: (item: GroceryItem) => Promise<void>;
  onUpdateGrocery: (itemId: string, data: Partial<Omit<GroceryItem, 'id'>>) => Promise<void>;
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V19l-4 2v-5.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const GroceryManager: React.FC<GroceryManagerProps> = (props) => {
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const [itemToEdit, setItemToEdit] = useState<GroceryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GroceryItem | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaserId, setPurchaserId] = useState('');

  const openAddModal = () => {
    setItemToEdit(null);
    setName('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setPurchaserId(props.members.length > 0 ? props.members[0].id : '');
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (item: GroceryItem) => {
    setItemToEdit(item);
    setName(item.name);
    setAmount(String(item.amount));
    setDate(new Date(item.date).toISOString().split('T')[0]);
    setPurchaserId(item.purchaserId);
    setIsAddEditModalOpen(true);
  };
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !date || !purchaserId || isSubmitting) return;
    setIsSubmitting(true);
    
    const groceryData = {
      name,
      amount: parseFloat(amount),
      date,
      purchaserId,
    };
    
    try {
      if (itemToEdit) {
        await props.onUpdateGrocery(itemToEdit.id, groceryData);
      } else {
        await props.onAddGrocery(groceryData);
      }
      setIsAddEditModalOpen(false);
    } catch(error) {
        // Error is handled by the hook
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const totalGroceryCost = props.groceries.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white shadow-lg rounded-lg">
      <div className="px-6 py-4 bg-gray-50 border-b rounded-t-lg flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-xl font-bold text-gray-800">TOTAL GROCERY BILL</h3>
          <p className="text-2xl font-semibold text-indigo-600">{formatCurrency(totalGroceryCost)}</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsFilterModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
                <FilterIcon />
                Filter
            </button>
            <button onClick={openAddModal} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                Add Expense
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
                   <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                   <button onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title={itemToEdit ? "Edit Expense" : "Add New Expense"} isOpen={isAddEditModalOpen} onClose={() => setIsAddEditModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
              <label htmlFor="purchaser" className="block text-sm font-medium text-gray-700">Purchased By</label>
               <select id="purchaser" value={purchaserId} onChange={(e) => setPurchaserId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {props.members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
           </div>
           <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name / Notes</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Milk, Bread, etc." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div>
             <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (AED)</label>
             <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" placeholder="e.g., 25.50" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
           </div>
           <div className="pt-2 flex justify-end">
             <button type="submit" disabled={isSubmitting || props.members.length === 0} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                {isSubmitting ? 'Saving...' : (itemToEdit ? 'Save Changes' : 'Add Expense')}
             </button>
           </div>
        </form>
      </Modal>

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