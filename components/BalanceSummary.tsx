/**
 * @file BalanceSummary.tsx
 * @summary Displays a summary of each member's financial status.
 */
import React from 'react';
import { Member } from '../types';

interface MemberSummary extends Member {
  totalDeposit: number;
  share: number;
  balance: number;
}

interface BalanceSummaryProps {
  summaries: MemberSummary[];
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summaries }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Balance Summary</h3>
      <div className="flow-root">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {summaries.map((summary) => (
            <li key={summary.id} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{summary.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    Deposited: {formatCurrency(summary.totalDeposit)} | Share: {formatCurrency(summary.share)}
                  </p>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      summary.balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {formatCurrency(summary.balance)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
       {summaries.length === 0 && <p className="text-center text-gray-500 mt-4">Add members to see their balance summary.</p>}
    </div>
  );
};
