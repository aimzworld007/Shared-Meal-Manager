/**
 * @file Dashboard.tsx
 * @summary The main administrator dashboard, displaying all meal and expense data.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import { SummaryCard } from './SummaryCard';
import MemberBalanceTable from './BalanceSummary';
import GroceryManager from './GroceryManager';
import MemberAndDepositManager from './MemberAndDepositManager';
import { logoDataUri } from '../assets/logo';
import PermissionsError from './PermissionsError';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    loading, 
    error, 
    summary,
    members,
    addGroceryItem,
    addMultipleGroceryItems,
    deleteGroceryItem, 
    addDepositItem, 
    deleteDepositItem,
    addMember,
    refreshData,
  } = useMealManager();

  // Check if the specific permission error is present
  const isPermissionError = error && error.includes('Permission Denied');

  return (
    <div className="bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <img src={logoDataUri} alt="Shared Meal Manager" className="h-10" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading && <p className="text-center text-gray-600">Loading dashboard data...</p>}
        
        {/* Render the specific PermissionsError component if it's a permission issue */}
        {isPermissionError && (
          <PermissionsError errorMessage={error} onRetry={refreshData} />
        )}

        {/* Render a generic error for other issues */}
        {!isPermissionError && error && (
          <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
        )}
        
        {!loading && !error && (
          <div className="space-y-8">
            {/* 1. Summary Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard title="Total Members" value={summary.totalMembers} />
              <SummaryCard title="Total Grocery Cost" value={summary.totalGroceryCost} isCurrency />
              <SummaryCard title="Total Deposits" value={summary.totalDeposits} isCurrency />
              <SummaryCard title="Average Expense" value={summary.averageExpense} isCurrency />
            </div>
            
            {/* 2. Grocery Expenses */}
            <GroceryManager 
              groceries={summary.allGroceries} 
              members={members}
              onAddGrocery={addGroceryItem} 
              onAddMultipleGroceries={addMultipleGroceryItems}
              onDeleteGrocery={deleteGroceryItem} 
            />

            {/* 3. Member & Deposit Management */}
            <MemberAndDepositManager
              members={members}
              deposits={summary.allDeposits}
              onAddMember={addMember}
              onAddDeposit={addDepositItem}
              onDeleteDeposit={deleteDepositItem}
            />
            
            {/* 4. Final Balance Table */}
            <MemberBalanceTable summary={summary} />

          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
