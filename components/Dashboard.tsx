/**
 * @file Dashboard.tsx
 * @summary The main dashboard screen for authenticated users.
 * It displays either the user-facing meal manager or the admin analytics panel.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import { ADMIN_UID } from '../services/firebase';
import AdminDashboard from './AdminDashboard';
import { SummaryCard } from './SummaryCard';
import { BalanceSummary } from './BalanceSummary';
import { ParticipantManager } from './ParticipantManager';
import { GroceryManager } from './GroceryManager';
import { DepositManager } from './DepositManager';

/**
 * The main application dashboard.
 * It fetches and displays all meal management data and provides controls
 * for adding/removing members, groceries, and deposits.
 * If the logged-in user is the admin, it shows the admin analytics dashboard.
 * @returns {JSX.Element} The rendered dashboard component.
 */
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.uid === ADMIN_UID;

  // We pass the admin UID for data fetching regardless of who is logged in,
  // because all data is stored under the admin's account.
  // In a real multi-tenant app, you'd pass user.uid.
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
  } = useMealManager(ADMIN_UID);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  if (isAdmin) {
      // Show admin view
      return (
          <div className="min-h-screen bg-gray-100">
              <header className="bg-white shadow">
                  <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                      <h1 className="text-3xl font-bold text-gray-900">Admin Analytics</h1>
                      <button
                          onClick={handleLogout}
                          className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                          Logout
                      </button>
                  </div>
              </header>
              <main>
                  <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                      <AdminDashboard />
                  </div>
              </main>
          </div>
      );
  }

  // Regular user view
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Shared Meal Manager</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-center text-gray-500">Loading your data...</p>
          ) : (
            <div className="space-y-8">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <SummaryCard title="Total Expense" value={totalExpense} isCurrency />
                <SummaryCard title="Total Deposits" value={totalDeposit} isCurrency />
                <SummaryCard title="Overall Balance" value={totalBalance} isCurrency />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <GroceryManager groceries={groceries} onAdd={addGrocery} onDelete={deleteGrocery} />
                    <DepositManager deposits={deposits} members={members} onAdd={addDeposit} onDelete={deleteDeposit} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <BalanceSummary summaries={memberSummaries} />
                    <ParticipantManager members={members} onAdd={addMember} onDelete={deleteMember} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
