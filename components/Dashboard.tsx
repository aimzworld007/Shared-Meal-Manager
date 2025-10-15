
/**
 * @file Dashboard.tsx
 * @summary The main view for authenticated users.
 * This component orchestrates the entire application layout post-login. It uses
 * the useMealManager hook to fetch and manage data, and renders various
 * sub-components to display and interact with that data.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import { SummaryCard, SummaryCardProps } from './SummaryCard';
import ParticipantManager from './ParticipantManager';
import GroceryManager from './GroceryManager';
import DepositManager from './DepositManager';
import BalanceSummary from './BalanceSummary';

/**
 * Renders the main dashboard layout.
 * Displays summary cards, data management sections, and the final balance table.
 * @returns {JSX.Element} The rendered Dashboard component.
 */
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    loading,
    participants,
    groceries,
    deposits,
    addParticipant,
    deleteParticipant,
    addGrocery,
    deleteGrocery,
    addDeposit,
    deleteDeposit,
    totalExpense,
    totalDeposit,
    totalBalance,
    participantSummaries,
  } = useMealManager(user?.uid ?? null);

  const summaryCards: SummaryCardProps[] = [
    { title: 'Total Expense', value: totalExpense, isCurrency: true },
    { title: 'Total Deposits', value: totalDeposit, isCurrency: true },
    { title: 'Final Balance', value: totalBalance, isCurrency: true, isPositive: totalBalance >= 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Meal Manager Dashboard</h1>
          <div>
            <span className="text-sm text-gray-600 mr-4">Welcome, {user?.email}</span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center text-gray-500">Loading data...</div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <SummaryCard key={card.title} {...card} />
              ))}
            </div>

            {/* Balance Summary Table */}
            <BalanceSummary summaries={participantSummaries} />

            {/* Data Management Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <ParticipantManager
                    participants={participants}
                    onAddParticipant={addParticipant}
                    onDeleteParticipant={deleteParticipant}
                />
                <GroceryManager
                    groceries={groceries}
                    onAddGrocery={addGrocery}
                    onDeleteGrocery={deleteGrocery}
                />
                <DepositManager
                    deposits={deposits}
                    participants={participants}
                    onAddDeposit={addDeposit}
                    onDeleteDeposit={deleteDeposit}
                />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
