/**
 * @file BalanceSummary.tsx
 * @summary Displays a detailed breakdown of the group's financial balance.
 */
import React from 'react';

interface BalanceSummaryProps {
  summary: {
    totalSpent: number; // Note: In this simplified view, this is the current user's spending
    individualShare: number;
    numberOfParticipants: number;
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
  }).format(amount);
};

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summary }) => {
  const { totalSpent, individualShare, numberOfParticipants } = summary;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Balance Summary</h3>
      <ul className="space-y-3 text-sm">
        <li className="flex justify-between">
          <span className="text-gray-600">Total Group Expense (Tracked by you):</span>
          <span className="font-semibold text-gray-800">{formatCurrency(totalSpent)}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-600">Number of Participants:</span>
          <span className="font-semibold text-gray-800">{numberOfParticipants}</span>
        </li>
        <li className="flex justify-between border-t pt-3 mt-3">
          <span className="text-gray-600 font-bold">Your Individual Share:</span>
          <span className="font-bold text-indigo-600">{formatCurrency(individualShare)}</span>
        </li>
      </ul>
      <p className="mt-4 text-xs text-gray-500">
        Your share is calculated based on the expenses you've logged. Your personal balance is your total deposits minus this share.
      </p>
    </div>
  );
};

export default BalanceSummary;
