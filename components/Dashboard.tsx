/**
 * @file Dashboard.tsx
 * @summary The main user interface after login, displaying meal and expense summaries.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import { SummaryCard } from './SummaryCard';
import BalanceSummary from './BalanceSummary';
import ParticipantManager from './ParticipantManager';
import GroceryManager from './GroceryManager';
import DepositManager from './DepositManager';
import AdminDashboard from './AdminDashboard';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    loading, 
    error, 
    groceries, 
    deposits,
    participants,
    balanceSummary, 
    addGroceryItem,
    addMultipleGroceryItems,
    deleteGroceryItem, 
    addDepositItem, 
    deleteDepositItem,
  } = useMealManager();

  // Route to admin dashboard if user has admin role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.email}
          </h1>
          <button
            onClick={logout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading && <p className="text-center text-gray-600">Loading your data...</p>}
        {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
        
        {!loading && !error && (
          <>
            {/* <!-- Summary Stats --> */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <SummaryCard title="Your Total Spending" value={balanceSummary.totalSpent} isCurrency />
              <SummaryCard title="Your Total Deposits" value={balanceSummary.totalDeposited} isCurrency />
              <SummaryCard title="Your Personal Balance" value={balanceSummary.personalBalance} isCurrency />
              <SummaryCard title="Participants" value={balanceSummary.numberOfParticipants} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* <!-- Left Column --> */}
              <div className="lg:col-span-2 space-y-6">
                <GroceryManager 
                  groceries={groceries} 
                  onAddGrocery={addGroceryItem} 
                  onAddMultipleGroceries={addMultipleGroceryItems}
                  onDeleteGrocery={deleteGroceryItem} 
                />
                <DepositManager 
                  deposits={deposits}
                  onAddDeposit={addDepositItem}
                  onDeleteDeposit={deleteDepositItem}
                />
              </div>
              {/* <!-- Right Column --> */}
              <div className="space-y-6">
                <BalanceSummary summary={balanceSummary} />
                <ParticipantManager participants={participants} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;