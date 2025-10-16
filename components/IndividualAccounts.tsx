/**
 * @file IndividualAccounts.tsx
 * @summary Displays a table of expenses paid by a single, selectable member.
 */
import React, { useState, useEffect } from 'react';
import { Member, GroceryItem } from '../types';

interface IndividualAccountsProps {
    members: Member[];
    groceries: GroceryItem[];
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const IndividualAccounts: React.FC<IndividualAccountsProps> = ({ members, groceries }) => {
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
            <div className="flex justify-between items-center mb-4 px-1 flex-wrap gap-4">
                <h2 className="text-xl font-bold text-gray-800">Individual Accounts</h2>
                {members.length > 0 && (
                    <div>
                        <label htmlFor="member-select" className="sr-only">Select Member</label>
                        <select
                            id="member-select"
                            value={selectedMemberId}
                            onChange={(e) => setSelectedMemberId(e.target.value)}
                            className="block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                        >
                            {members.map(member => (
                                <option key={member.id} value={member.id}>{member.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            
            {selectedMember ? (
                <div className="bg-white border border-gray-200">
                    <div className="px-4 py-3 bg-green-600 text-white">
                        <h3 className="text-lg font-bold uppercase">{selectedMember.name} PAID</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                                    <th scope="col" className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {memberGroceries.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(item.amount)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                    </tr>
                                ))}
                                {memberGroceries.length === 0 && (
                                    <tr><td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">No expenses recorded.</td></tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                                <tr>
                                    <td className="px-4 py-2 text-right font-bold text-gray-800">Total</td>
                                    <td colSpan={2} className="px-4 py-2 font-bold text-gray-900">{formatCurrency(totalPaid)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    <p>No members available to display. Please add a member in Settings.</p>
                </div>
            )}
        </div>
    );
};

export default IndividualAccounts;