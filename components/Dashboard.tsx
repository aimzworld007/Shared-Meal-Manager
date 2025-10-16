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
import SettingsPage from './SettingsPage';
import { logoUrl as defaultLogoUrl } from '../assets/logo';

// Define the BeforeInstallPromptEvent interface for PWA installation
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface DashboardProps {
  logoUrl?: string;
  installPromptEvent: BeforeInstallPromptEvent | null;
  onInstallClick: () => void;
}

const InstallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const Dashboard: React.FC<DashboardProps> = ({ logoUrl, installPromptEvent, onInstallClick }) => {
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const { user, logout } = useAuth();
  const mealManager = useMealManager();

  const {
    loading,
    error,
    summary,
    members,
    refreshData,
  } = mealManager;

  const isPermissionError = error && error.includes('Permission Denied');

  const DashboardContent = () => (
    <>
      {loading && <p className="text-center text-gray-600">Loading your dashboard...</p>}
      {isPermissionError && <PermissionsError errorMessage={error} onRetry={refreshData} />}
      {!isPermissionError && error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
      {!loading && !error && (
        <div className="space-y-8">
          <GroceryManager
            groceries={summary.allGroceries}
            members={members}
            onAddGrocery={mealManager.addGroceryItem}
            onDeleteGrocery={mealManager.deleteGroceryItem}
            onUpdateGrocery={mealManager.updateGroceryItem}
            // Filter props
            startDate={mealManager.startDate}
            endDate={mealManager.endDate}
            minAmount={mealManager.minAmount}
            maxAmount={mealManager.maxAmount}
            selectedPurchaser={mealManager.selectedPurchaser}
            onStartDateChange={mealManager.setStartDate}
            onEndDateChange={mealManager.setEndDate}
            onMinAmountChange={mealManager.setMinAmount}
            onMaxAmountChange={mealManager.setMaxAmount}
            onPurchaserChange={mealManager.setSelectedPurchaser}
            onResetFilters={mealManager.resetFilters}
          />
           <IndividualAccounts members={summary.members} groceries={summary.allGroceries} />
           <MainBalanceSummary summary={summary} />
          <MemberAndDepositManager
            members={members}
            deposits={summary.allDeposits}
            onAddDeposit={mealManager.addDepositItem}
            onDeleteDeposit={mealManager.deleteDepositItem}
            onUpdateDeposit={mealManager.updateDepositItem}
          />
        </div>
      )}
    </>
  );

  return (
    <div className="bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
          <img src={logoUrl || defaultLogoUrl} alt="Logo" className="h-10" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 hidden sm:block order-first">Welcome, {user?.email}</span>
            {installPromptEvent && (
               <button onClick={onInstallClick} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                   <InstallIcon />
                   Install App
               </button>
            )}
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
        {view === 'dashboard' ? <DashboardContent /> : <SettingsPage
            members={members}
            summary={summary}
            onAddMember={mealManager.addMember}
            onUpdateMember={mealManager.updateMember}
            onDeleteMember={mealManager.deleteMember}
            onImportGroceries={mealManager.importGroceryItems}
        />}
      </main>
    </div>
  );
};

export default Dashboard;
