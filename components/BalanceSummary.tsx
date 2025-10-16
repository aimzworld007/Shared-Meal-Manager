/**
 * @file MainBalanceSummary.tsx
 * @summary Displays a detailed table of all members' financial summaries.
 */
import React from 'react';
import { Member } from '../types';

interface MainBalanceSummaryProps {
  summary: {
    members: Member[];
    totalGroceryCost: number;
    totalDeposits: number;
    averageExpense: number;
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
  }).format(amount);
};

const MainBalanceSummary: React.FC<MainBalanceSummaryProps> = ({ summary }) => {
  const totalPaidAmount = summary.members.reduce((sum, member) => sum + member.totalPurchase, 0);

  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 bg-teal-700 text-white flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-bold">MAIN BALANCE SUMMARY</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-16">S.N</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Paid Amount</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Deposit</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summary.members.map((member, index) => (
              <tr key={member.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{index + 1}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(member.totalPurchase)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(member.totalDeposit)}</td>
                <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${member.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(member.balance)}
                </td>
              </tr>
            ))}
            {summary.members.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">No members found.</td></tr>
            )}
          </tbody>
          <tfoot className="bg-gray-100 border-t-2 border-gray-300">
            <tr>
              <td colSpan={2} className="px-4 py-2 text-right text-sm font-bold text-gray-800">Total Amount</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(totalPaidAmount)}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(summary.totalDeposits)}</td>
              <td className="px-4 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
        <div className="inline-block text-left space-y-1">
            <p className="text-sm">
                <span className="font-semibold text-gray-700">Total Grocery Amount: </span> 
                <span className="font-bold text-gray-900">{formatCurrency(summary.totalGroceryCost)}</span>
            </p>
            <p className="text-sm">
                <span className="font-semibold text-gray-700">{summary.members.length} Person Average: </span> 
                <span className="font-bold text-gray-900">{formatCurrency(summary.averageExpense)}</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default MainBalanceSummary;