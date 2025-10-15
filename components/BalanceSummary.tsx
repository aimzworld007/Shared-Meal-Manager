/**
 * @file BalanceSummary.tsx
 * @summary Displays a table summarizing the financial status of each member.
 */
import React from 'react';

/**
 * Represents the calculated summary for a single member.
 */
interface MemberSummary {
    /** The unique ID of the member. */
    id: string;
    /** The name of the member. */
    name: string;
    /** The total amount deposited by the member. */
    totalDeposit: number;
    /** The member's equal share of the total expenses. */
    share: number;
    /** The final balance (Total Deposit - Share). Can be positive or negative. */
    balance: number;
}

/**
 * Props for the BalanceSummary component.
 */
interface BalanceSummaryProps {
    /** An array of calculated member summaries. */
    summaries: MemberSummary[];
}

/**
 * Renders a table showing each member's deposits, share of expenses, and final balance.
 * @param {BalanceSummaryProps} props - The component props.
 * @param {MemberSummary[]} props.summaries - The list of member financial summaries to display.
 * @returns {JSX.Element} The rendered balance summary table component.
 */
const BalanceSummary: React.FC<BalanceSummaryProps> = ({ summaries }) => {
    
    /**
     * Formats a number as a currency string in AED.
     * @param {number} amount - The number to format.
     * @returns {string} The formatted currency string.
     */
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Balance Summary</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deposit</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share of Expense</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {summaries.length === 0 ? (
                             <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Add members to see a balance summary.
                                </td>
                            </tr>
                        ) : (
                            summaries.map((s) => (
                                <tr key={s.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(s.totalDeposit)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(s.share)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${s.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(s.balance)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BalanceSummary;
