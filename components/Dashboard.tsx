/**
 * @file Dashboard.tsx
 * @summary The main user dashboard, displaying all meal and expense data for the logged-in user.
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import MainBalanceSummary from './BalanceSummary';
import IndividualAccounts from './IndividualAccounts';
import GroceryManager from './GroceryManager';
import MemberAndDepositManager from './MemberAndDepositManager';
import PermissionsError from './PermissionsError';
import DataFilter from './DateFilter';
import SettingsPage from './SettingsPage';
import { logoDataUri } from '../assets/logo';

interface DashboardProps {
  logoUrl?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ logoUrl }) => {
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const { user, logout } = useAuth();
  const { 
    loading, 
    error, 
    summary,
    members,
    // filters
    startDate,
    endDate,
    minAmount,
    maxAmount,
    selectedPurchaser,
    setStartDate,
    setEndDate,
    setMinAmount,
    setMaxAmount,
    setSelectedPurchaser,
    resetFilters,
    // actions
    addGroceryItem,
    importGroceryItems,
    deleteGroceryItem, 
    addDepositItem, 
    deleteDepositItem,
    addMember,
    refreshData,
  } = useMealManager();

  const isPermissionError = error && error.includes('Permission Denied');

  const DashboardContent = () => (
    <>
      {loading && <p className="text-center text-gray-600">Loading your dashboard...</p>}
      {isPermissionError && <PermissionsError errorMessage={error} onRetry={refreshData} />}
      {!isPermissionError && error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
      {!loading && !error && (
        <div className="space-y-8">
          <DataFilter 
            startDate={startDate}
            endDate={endDate}
            minAmount={minAmount}
            maxAmount={maxAmount}
            selectedPurchaser={selectedPurchaser}
            members={members}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onMinAmountChange={setMinAmount}
            onMaxAmountChange={setMaxAmount}
            onPurchaserChange={setSelectedPurchaser}
            onReset={resetFilters}
          />
          <GroceryManager 
            groceries={summary.allGroceries} 
            members={members}
            onAddGrocery={addGroceryItem} 
            onImportGroceries={importGroceryItems}
            onDeleteGrocery={deleteGroceryItem} 
          />
           <IndividualAccounts members={summary.members} groceries={summary.allGroceries} />
           <MainBalanceSummary summary={summary} />
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
          <img src={logoUrl || logoDataUri} alt="Logo" className="h-10" />
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
