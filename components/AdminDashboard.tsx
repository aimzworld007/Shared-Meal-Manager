/**
 * @file AdminDashboard.tsx
 * @summary The main dashboard for admin users, showing platform-wide analytics.
 */
import React from 'react';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import { useAuth } from '../hooks/useAuth';
import { SummaryCard } from './SummaryCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
);

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { loading, globalStats, expenseVsDepositChartData, spendingOverTimeChartData } = useAdminAnalytics();
    
    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Expense vs. Deposit per User' },
        },
    };
    
    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Cumulative Spending Over Time' },
        },
    };


    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm">
                 <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">Admin Analytics</h1>
                     <div className='flex items-center'>
                        <span className='text-sm text-gray-600 mr-4'>{user?.email} (Admin)</span>
                        <button onClick={logout} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>
            <main className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading admin data...</p>
                    ) : (
                        <div className='space-y-6'>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <SummaryCard title="Total Users" value={globalStats.totalUsers} />
                                <SummaryCard title="Total Platform Expense" value={globalStats.totalExpense} isCurrency />
                                <SummaryCard title="Total Platform Deposits" value={globalStats.totalDeposit} isCurrency />
                            </div>

                            <div className="bg-white shadow rounded-lg p-6">
                                {expenseVsDepositChartData.labels.length > 0 ? (
                                    <Bar options={barChartOptions} data={expenseVsDepositChartData} />
                                ) : (
                                    <p className="text-center text-gray-500">No data available for expense vs. deposit chart.</p>
                                )}
                            </div>

                             <div className="bg-white shadow rounded-lg p-6">
                                {spendingOverTimeChartData.labels.length > 0 ? (
                                    <Line options={lineChartOptions} data={spendingOverTimeChartData} />
                                ) : (
                                    <p className="text-center text-gray-500">No spending data available to display chart.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
