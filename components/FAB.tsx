/**
 * @file FAB.tsx
 * @summary A Floating Action Button component for quick actions.
 */
import React from 'react';

interface FABProps {
  onAddExpense: () => void;
}

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const FAB: React.FC<FABProps> = ({ onAddExpense }) => {
  return (
    <div className="fixed bottom-24 right-4 z-30">
        <button 
          onClick={onAddExpense} 
          className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Add Expense"
        >
            <PlusIcon />
        </button>
    </div>
  );
};

export default FAB;