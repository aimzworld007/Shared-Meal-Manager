/**
 * @file Dashboard.tsx
 * @summary The main administrator dashboard, displaying all meal and expense data.
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import MainBalanceSummary from './BalanceSummary';
import IndividualAccounts from './IndividualAccounts';
import GroceryManager from './GroceryManager';
import MemberAndDepositManager from './MemberAndDepositManager';
import { useSettings } from '../hooks/useSettings';
import PermissionsError from './PermissionsError';
import DateFilter from './DateFilter';
import SettingsPage from './SettingsPage';

const Dashboard: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const { user, logout } = useAuth();
  const { config } = useSettings();
  const { 
    loading, 
    error, 
    summary,
    members,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    resetDateFilter,
    addGroceryItem,
    addMultipleGroceryItems,
    deleteGroceryItem, 
    addDepositItem, 
    deleteDepositItem,
    addMember,
    refreshData,
  } = useMealManager();

  const isPermissionError = error && error.includes('Permission Denied');

  const DashboardContent = () => (
    <>
      {loading && <p className="text-center text-gray-600">Loading dashboard data...</p>}
      {isPermissionError && <PermissionsError errorMessage={error} onRetry={refreshData} />}
      {!isPermissionError && error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
      {!loading && !error && (
        <div className="space-y-8">
          <DateFilter 
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={resetDateFilter}
          />
          <MainBalanceSummary summary={summary} />
          <IndividualAccounts members={summary.members} groceries={summary.allGroceries} />
          <GroceryManager 
            groceries={summary.allGroceries} 
            members={members}
            onAddGrocery={addGroceryItem} 
            onAddMultipleGroceries={addMultipleGroceryItems}
            onDeleteGrocery={deleteGroceryItem} 
          />
          <MemberAndDepositManager
            members={members}
            deposits={summary.allDeposits}
            onAddMember={addMember}
            onAddDeposit={addDepositItem}
            onDeleteDeposit={deleteDepositItem}
          />
        </div>
      )}
    </>
  );

  return (
    <div className="bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <img src={config?.logoUrl} alt="Logo" className="h-10" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
            {view === 'dashboard' ? (
                 <button onClick={() => setView('settings')} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Settings</button>
            ) : (
                 <button onClick={() => setView('dashboard')} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Dashboard</button>
            )}
            <button onClick={logout} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'dashboard' ? <DashboardContent /> : <SettingsPage />}
      </main>
    </div>
  );
};

export default Dashboard;
