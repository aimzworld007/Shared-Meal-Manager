/**
 * @file AdminDashboard.tsx
 * @summary The admin-only dashboard for viewing platform-wide analytics.
 */
import React from 'react';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import { SummaryCard } from './SummaryCard';
import { Bar, Line } from 'react-chartjs-2';
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

// Register Chart.js components to be used
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Renders the admin analytics dashboard.
 * @returns {JSX.Element} The rendered admin dashboard component.
 */
const AdminDashboard: React.FC = () => {
    const { loading, globalStats, expenseVsDepositChartData, spendingOverTimeChartData } = useAdminAnalytics();

    if (loading) {
        return <div className="text-center text-gray-500">Loading admin data...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Admin Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <SummaryCard title="Total Users" value={globalStats.totalUsers} />
                <SummaryCard title="Platform Expense" value={globalStats.totalExpense} isCurrency />
                <SummaryCard title="Platform Deposits" value={globalStats.totalDeposit} isCurrency />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Expense vs. Deposit per User</h3>
                    {expenseVsDepositChartData.labels.length > 0 ? (
                        <Bar
                            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
                            data={expenseVsDepositChartData}
                        />
                    ) : (
                        <p className="text-center text-gray-500">No data to display.</p>
                    )}
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Spending Over Time</h3>
                    {spendingOverTimeChartData.labels.length > 0 ? (
                        <Line
                             options={{ responsive: true, plugins: { legend: { display: false } } }}
                             data={spendingOverTimeChartData}
                        />
                    ) : (
                         <p className="text-center text-gray-500">No spending data yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
