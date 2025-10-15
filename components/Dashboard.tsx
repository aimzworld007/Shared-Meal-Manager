/**
 * @file Dashboard.tsx
 * @summary The main view for authenticated users.
 * This component orchestrates the entire application layout post-login. It uses
 * the useMealManager hook to fetch and manage data, and renders various
 * sub-components to display and interact with that data. It also includes
 * a conditional view for the admin dashboard.
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import { SummaryCard, SummaryCardProps } from './SummaryCard';
import MemberManager from './ParticipantManager';
import GroceryManager from './GroceryManager';
import DepositManager from './DepositManager';
import BalanceSummary from './BalanceSummary';
import AdminDashboard from './AdminDashboard';
import { ADMIN_UID } from '../services/firebase';

/**
 * Renders the main dashboard layout.
 * Displays summary cards, data management sections, and the final balance table.
 * If the user is an admin, it provides an option to switch to the admin view.
 * @returns {JSX.Element} The rendered Dashboard component.
 */
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [isAdminView, setIsAdminView] = useState(false);
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
    totalExpense,
    totalDeposit,
    totalBalance,
    memberSummaries,
  } = useMealManager(user?.uid ?? null);

  const summaryCards: SummaryCardProps[] = [
    { title: 'Total Expense', value: totalExpense, isCurrency: true },
    { title: 'Total Deposits', value: totalDeposit, isCurrency: true },
    { title: 'Final Balance', value: totalBalance, isCurrency: true, isPositive: totalBalance >= 0 },
  ];

  const isUserAdmin = user?.uid === ADMIN_UID;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdminView ? 'Admin Analytics' : 'Meal Manager Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user?.email}</span>
            {isUserAdmin && (
              <button
                onClick={() => setIsAdminView(!isAdminView)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition"
              >
                {isAdminView ? 'My Dashboard' : 'Admin View'}
              </button>
            )}
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
        {isAdminView ? (
          <AdminDashboard />
        ) : (
          loading ? (
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
              <BalanceSummary summaries={memberSummaries} />

              {/* Data Management Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <MemberManager
                      members={members}
                      onAddMember={addMember}
                      onDeleteMember={deleteMember}
                  />
                  <GroceryManager
                      groceries={groceries}
                      onAddGrocery={addGrocery}
                      onDeleteGrocery={deleteGrocery}
                  />
                  <DepositManager
                      deposits={deposits}
                      members={members}
                      onAddDeposit={addDeposit}
                      onDeleteDeposit={deleteDeposit}
                  />
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Dashboard;
