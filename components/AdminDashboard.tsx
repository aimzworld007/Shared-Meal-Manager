/**
 * @file AdminDashboard.tsx
 * @summary Provides a platform-wide analytics view for administrators.
 */
import React from 'react';
import { useAdminAnalytics } from '../hooks/useAdminAnalytics';
import { SummaryCard } from './SummaryCard';
import BalanceChart from './BalanceChart';

const AdminDashboard: React.FC = () => {
  const {
    loading,
    globalStats,
    expenseVsDepositChartData,
    spendingOverTimeChartData
  } = useAdminAnalytics();

  if (loading) {
    return <div className="text-center py-10">Loading admin analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard title="Total Active Users" value={globalStats.totalUsers} />
          <SummaryCard title="Platform-Wide Expense" value={globalStats.totalExpense} isCurrency />
          <SummaryCard title="Platform-Wide Deposits" value={globalStats.totalDeposit} isCurrency />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BalanceChart
          type="bar"
          data={expenseVsDepositChartData}
          title="Expense vs. Deposit per User"
        />
        <BalanceChart
          type="line"
          data={spendingOverTimeChartData}
          title="Cumulative Spending Over Time"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
