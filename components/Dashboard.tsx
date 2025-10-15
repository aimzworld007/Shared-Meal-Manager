/**
 * @file Dashboard.tsx
 * @summary The main dashboard view for authenticated users.
 * It displays an overview of finances and provides components to manage
 * members, groceries, and deposits.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import AdminDashboard from './AdminDashboard';
import { SummaryCard } from './SummaryCard';
import { BalanceSummary } from './BalanceSummary';
import { ParticipantManager } from './ParticipantManager';
import { GroceryManager } from './GroceryManager';
import { DepositManager } from './DepositManager';

// A simple way to designate an admin user. In a real app, this would be role-based.
const ADMIN_EMAIL = 'admin@example.com';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const {
        loading,
        members,
        groceries,
        deposits,
        addMember,
        deleteMember,
        addGrocery,
        deleteGrocery,
        addDeposit,
        deleteDeposit,
        totalSpent,
        totalDeposits,
        balanceSummaries,
    } = useMealManager();

    if (user?.email === ADMIN_EMAIL) {
        return <AdminDashboard />;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Meal Manager Dashboard</h1>
                    <div className='flex items-center'>
                        <span className='text-sm text-gray-600 mr-4'>{user?.email}</span>
                        <button
                            onClick={logout}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>
            <main className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading your data...</p>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <SummaryCard title="Total Members" value={members.length} />
                                <SummaryCard title="Total Spent" value={totalSpent} isCurrency />
                                <SummaryCard title="Total Deposits" value={totalDeposits} isCurrency />
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <GroceryManager groceries={groceries} addGrocery={addGrocery} deleteGrocery={deleteGrocery} />
                                    <DepositManager deposits={deposits} members={members} addDeposit={addDeposit} deleteDeposit={deleteDeposit} />
                                </div>
                                <div className="space-y-6">
                                    <ParticipantManager members={members} addMember={addMember} deleteMember={deleteMember} />
                                    <BalanceSummary summaries={balanceSummaries} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
