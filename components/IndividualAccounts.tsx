/**
 * @file IndividualAccounts.tsx
 * @summary Displays a grid of tables, each showing the expenses paid by a single member.
 */
import React from 'react';
import { Member, GroceryItem } from '../types';

interface IndividualAccountsProps {
    members: Member[];
    groceries: GroceryItem[];
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const IndividualAccounts: React.FC<IndividualAccountsProps> = ({ members, groceries }) => {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => {
                    const memberGroceries = groceries.filter(g => g.purchaserId === member.id);
                    const totalPaid = memberGroceries.reduce((sum, item) => sum + item.amount, 0);

                    return (
                        <div key={member.id} className="bg-white border border-gray-200">
                            <div className="px-4 py-3 bg-green-600 text-white">
                                <h3 className="text-lg font-bold uppercase">{member.name} PAID</h3>
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
                    );
                })}
            </div>
        </div>
    );
};

export default IndividualAccounts;