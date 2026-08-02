/**
 * @file MainBalanceSummary.tsx
 * @summary Displays a detailed table of all members' financial summaries.
 */
import React from 'react';
import { Member } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

interface MainBalanceSummaryProps {
  summary: {
    members: Member[];
    totalGroceryCost: number;
    totalDeposits: number;
    averageExpense: number;
  };
}

const MainBalanceSummary: React.FC<MainBalanceSummaryProps> = ({ summary }) => {
  const { currency } = useAuth();
  const totalPaidAmount = summary.members.reduce((sum, member) => sum + member.totalPurchase, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="px-6 py-4 bg-teal-700 text-white flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-xl font-bold tracking-tight">Balance Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">S.N</th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid Amount</th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deposit</th>
              <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
            {summary.members.map((member, index) => (
              <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{index + 1}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{member.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{formatCurrency(member.totalPurchase, currency)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{formatCurrency(member.totalDeposit, currency)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold">
                   <span className={`px-3 py-1 rounded-full ${member.balance >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                     {formatCurrency(member.balance, currency)}
                   </span>
                </td>
              </tr>
            ))}
            {summary.members.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No members found.</td></tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
            <tr>
              <td colSpan={2} className="px-4 py-4 text-right text-sm font-bold text-slate-700 dark:text-slate-300">Total Amount</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-extrabold text-slate-900 dark:text-white">{formatCurrency(totalPaidAmount, currency)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-extrabold text-slate-900 dark:text-white">{formatCurrency(summary.totalDeposits, currency)}</td>
              <td className="px-4 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-right">
        <div className="inline-block text-left space-y-2">
            <p className="text-base">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Total Grocery Amount: </span> 
                <span className="font-extrabold text-slate-900 dark:text-white ml-2">{formatCurrency(summary.totalGroceryCost, currency)}</span>
            </p>
            <p className="text-base">
                <span className="font-semibold text-slate-600 dark:text-slate-400">{summary.members.length} Person Average: </span> 
                <span className="font-extrabold text-slate-900 dark:text-white ml-2">{formatCurrency(summary.averageExpense, currency)}</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default MainBalanceSummary;