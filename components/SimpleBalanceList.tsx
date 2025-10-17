/**
 * @file SimpleBalanceList.tsx
 * @summary A component to display a simplified list of member balances.
 */
import React from 'react';
import { Member } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SimpleBalanceListProps {
  members: Member[];
  onViewDetails: () => void;
}

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const SimpleBalanceList: React.FC<SimpleBalanceListProps> = ({ members, onViewDetails }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Member Balances</h3>
             <button
                onClick={onViewDetails}
                className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
                View Details
                <ArrowRightIcon />
            </button>
        </div>
        <div className="p-4 sm:p-6">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.length === 0 && (
                    <li className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        No members found.
                    </li>
                )}
                {members.map(member => (
                    <li key={member.id} className="py-3 flex justify-between items-center">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{member.name}</span>
                        <span className={`font-semibold text-lg ${member.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(member.balance)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default SimpleBalanceList;