/**
 * @file BalanceSummary.tsx
 * @summary Displays a detailed table of all members' financial summaries.
 */
import React from 'react';
import { Member } from '../types';

interface MemberBalanceTableProps {
  summary: {
    members: Member[];
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
  }).format(amount);
};

const MemberBalanceTable: React.FC<MemberBalanceTableProps> = ({ summary }) => {

  const handleDownloadCsv = () => {
    const headers = ['Member', 'Total Purchase', 'Total Deposit', 'Balance', 'Status'];
    const rows = summary.members.map(member => [
      `"${member.email}"`,
      member.totalPurchase.toFixed(2),
      member.totalDeposit.toFixed(2),
      member.balance.toFixed(2),
      member.balance >= 0 ? 'Receivable' : 'Payable'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "meal_manager_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Member Balances</h3>
        <button
          onClick={handleDownloadCsv}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchase</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deposit</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summary.members.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(member.totalPurchase)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(member.totalDeposit)}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${member.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(member.balance)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {member.balance >= 0 ? 'Receivable' : 'Payable'}
                  </span>
                </td>
              </tr>
            ))}
             {summary.members.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No members found. Add a member to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberBalanceTable;