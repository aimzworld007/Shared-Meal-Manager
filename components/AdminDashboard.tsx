/**
 * @file AdminDashboard.tsx
 * @summary Provides a platform-wide analytics view for administrators.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import { SummaryCard } from './SummaryCard';
import BalanceChart from './BalanceChart';

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const {
        loading,
        globalStats,
        expenseVsDepositChartData,
        spendingOverTimeChartData
    } = useAdminAnalytics();

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500">Logged in as {user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Logout
                    </button>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {loading && <p className="text-center text-lg text-gray-600">Loading admin analytics...</p>}
                {!loading && (
                    <div className="space-y-6">
                        {/* Global Stats */}
                        <h2 className="text-xl font-semibold text-gray-800">Platform Overview</h2>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <SummaryCard title="Total Users" value={globalStats.totalUsers} />
                            <SummaryCard title="Total Platform Expense" value={globalStats.totalExpense} isCurrency />
                            <SummaryCard title="Total Platform Deposits" value={globalStats.totalDeposit} isCurrency />
                        </div>

                        {/* Charts */}
                        <h2 className="text-xl font-semibold text-gray-800 mt-8">Visualizations</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           <BalanceChart type="bar" data={expenseVsDepositChartData} title="Expense vs. Deposit per User" />
                           <BalanceChart type="line" data={spendingOverTimeChartData} title="Cumulative Spending Over Time" />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
