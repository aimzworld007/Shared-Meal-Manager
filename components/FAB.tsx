/**
 * @file FAB.tsx
 * @summary A Floating Action Button component for quick actions with a speed dial menu.
 */
import React, { useState, useEffect, useRef } from 'react';

interface FABProps {
  onAddExpense: () => void;
  onAddDeposit: () => void;
}

// Icons
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const ExpenseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const DepositIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


const FAB: React.FC<FABProps> = ({ onAddExpense, onAddDeposit }) => {
    const [isOpen, setIsOpen] = useState(false);
    const fabRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && fabRef.current && !fabRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleActionClick = (action: () => void) => {
        action();
        setIsOpen(false);
    };

  return (
    <div ref={fabRef} className="fixed bottom-24 right-4 z-30 flex flex-col-reverse items-end">
        {/* Main FAB */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform duration-200"
          aria-label={isOpen ? "Close actions" : "Open actions"}
          aria-expanded={isOpen}
        >
            <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                 <PlusIcon />
            </div>
        </button>

        {/* Action Buttons */}
        <div
            className={`flex flex-col items-end gap-4 mb-4 transition-all duration-300 ease-in-out ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
             {/* Add Expense */}
            <div className="flex items-center gap-3">
                 <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg dark:bg-gray-700">
                    Add Expense
                </div>
                <button 
                    onClick={() => handleActionClick(onAddExpense)} 
                    className="bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                    aria-label="Add Expense"
                    tabIndex={isOpen ? 0 : -1}
                >
                    <ExpenseIcon />
                </button>
            </div>
            {/* Add Deposit */}
            <div className="flex items-center gap-3">
                 <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg dark:bg-gray-700">
                    Add Deposit
                </div>
                <button 
                    onClick={() => handleActionClick(onAddDeposit)} 
                    className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-green-700"
                    aria-label="Add Deposit"
                    tabIndex={isOpen ? 0 : -1}
                >
                    <DepositIcon />
                </button>
            </div>
        </div>

    </div>
  );
};

export default FAB;
