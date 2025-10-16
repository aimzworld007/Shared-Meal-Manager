/**
 * @file FAB.tsx
 * @summary A Floating Action Button component for quick actions.
 */
import React, { useState } from 'react';

interface FABProps {
  onAddExpense: () => void;
  onAddDeposit: () => void;
}

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const GroceryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const DepositIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const FAB: React.FC<FABProps> = ({ onAddExpense, onAddDeposit }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddExpense = () => {
    onAddExpense();
    setIsOpen(false);
  };
  
  const handleAddDeposit = () => {
    onAddDeposit();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-30">
        <div className="relative flex flex-col items-center gap-4">
             {/* Action Buttons */}
            <div className={`transition-all duration-300 ease-in-out flex flex-col items-center gap-4 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                 <div className="flex items-center gap-3">
                    <span className="bg-white text-sm text-gray-700 font-semibold px-3 py-1 rounded-md shadow-lg">Add Deposit</span>
                    <button onClick={handleAddDeposit} className="bg-green-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                        <DepositIcon />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <span className="bg-white text-sm text-gray-700 font-semibold px-3 py-1 rounded-md shadow-lg">Add Expense</span>
                    <button onClick={handleAddExpense} className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                       <GroceryIcon />
                    </button>
                </div>
            </div>

            {/* Main FAB */}
            <button onClick={() => setIsOpen(!isOpen)} className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform duration-300 ease-in-out" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>
                <PlusIcon />
            </button>
        </div>
    </div>
  );
};

export default FAB;
