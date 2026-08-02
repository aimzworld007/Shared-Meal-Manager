/**
 * @file IndividualAccounts.tsx
 * @summary Displays a table of expenses paid by a single, selectable member.
 */
import React, { useState, useEffect } from 'react';
import { Member, GroceryItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

interface IndividualAccountsProps {
    members: Member[];
    groceries: GroceryItem[];
}

const IndividualAccounts: React.FC<IndividualAccountsProps> = ({ members, groceries }) => {
    const { currency } = useAuth();
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');

    useEffect(() => {
        // Set the default selected member to the first one in the list
        if (members.length > 0 && !selectedMemberId) {
            setSelectedMemberId(members[0].id);
        }
        // If the selected member is no longer in the list (e.g., deleted), reset to the first member
        if (members.length > 0 && selectedMemberId && !members.some(m => m.id === selectedMemberId)) {
            setSelectedMemberId(members[0].id);
        }
        // If there are no members, clear the selection
        if (members.length === 0) {
            setSelectedMemberId('');
        }
    }, [members, selectedMemberId]);

    const selectedMember = members.find(member => member.id === selectedMemberId);
    const memberGroceries = selectedMember ? groceries.filter(g => g.purchaserId === selectedMember.id) : [];
    const totalPaid = memberGroceries.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6 px-1 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Individual Accounts</h2>
                {members.length > 0 && (
                    <div>
                        <label htmlFor="member-select" className="sr-only">Select Member</label>
                        <select
                            id="member-select"
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                            className="block w-full sm:w-64 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 dark:text-white transition-all appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
                        >
                            {members.map(member => (
                                <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            
            {selectedMember ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center flex-wrap gap-2">
                        <h3 className="text-xl font-bold uppercase tracking-tight">{selectedMember.name} PAID</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
                                {memberGroceries.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount, currency)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</td>
                                    </tr>
                                ))}
                                {memberGroceries.length === 0 && (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No expenses recorded.</td></tr>
                                )}
                            </tbody>
                            <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                                <tr>
                                    <td className="px-4 py-4 text-right text-sm font-bold text-slate-700 dark:text-slate-300">Total</td>
                                    <td colSpan={2} className="px-4 py-4 font-extrabold text-slate-900 dark:text-white">{formatCurrency(totalPaid, currency)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
                    <p>No members available to display. Please add a member in Settings.</p>
                </div>
            )}
        </div>
    );
};

export default IndividualAccounts;