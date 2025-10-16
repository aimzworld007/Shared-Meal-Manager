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
import MonthlySpendChart from './MonthlySpendChart';
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
}

// Define view types for bottom navigation
type View = 'grocery' | 'balance' | 'accounts' | 'deposit';

// --- Icon Components ---
const GroceryIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const BalanceIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
);

const AccountsIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const DepositIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


const Dashboard: React.FC<DashboardProps> = ({ logoUrl }) => {
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const [activeTab, setActiveTab] = useState<View>('grocery');
  const { user, logout } = useAuth();
  const mealManager = useMealManager();

  const {
    loading,
    error,
    summary,
    members,
    groceries,
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
          {activeTab === 'grocery' && (
            <GroceryManager
              groceries={summary.allGroceries}
              members={members}
              onAddGrocery={mealManager.addGroceryItem}
              onDeleteGrocery={mealManager.deleteGroceryItem}
              onUpdateGrocery={mealManager.updateGroceryItem}
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
          )}
          {activeTab === 'balance' && (
            <div className="space-y-8">
              <MonthlySpendChart groceries={groceries} />
              <MainBalanceSummary summary={summary} />
            </div>
          )}
          {activeTab === 'accounts' && <IndividualAccounts members={summary.members} groceries={summary.allGroceries} />}
          {activeTab === 'deposit' && (
            <MemberAndDepositManager
              members={members}
              deposits={summary.allDeposits}
              onAddDeposit={mealManager.addDepositItem}
              onDeleteDeposit={mealManager.deleteDepositItem}
              onUpdateDeposit={mealManager.updateDepositItem}
            />
          )}
        </div>
      )}
    </>
  );

  const navItems = [
      { id: 'grocery', label: 'Grocery Bill', icon: GroceryIcon },
      { id: 'balance', label: 'Balance', icon: BalanceIcon },
      { id: 'accounts', label: 'Accounts', icon: AccountsIcon },
      { id: 'deposit', label: 'Deposit', icon: DepositIcon },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
          <img src={logoUrl || defaultLogoUrl} alt="Logo" className="h-10" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 hidden sm:block order-first">Welcome, {user?.email}</span>
            {view === 'dashboard' ? (
                 <button onClick={() => setView('settings')} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Settings</button>
            ) : (
                 <button onClick={() => setView('dashboard')} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">Dashboard</button>
            )}
            <button onClick={logout} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pb-24">
        {view === 'dashboard' ? <DashboardContent /> : <SettingsPage
            members={members}
            summary={summary}
            onAddMember={mealManager.addMember}
            onUpdateMember={mealManager.updateMember}
            onDeleteMember={mealManager.deleteMember}
            onSetMealManager={mealManager.setMealManager}
            onImportGroceries={mealManager.importGroceryItems}
        />}
      </main>

       {/* Bottom Navigation Bar */}
      {view === 'dashboard' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-20">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex justify-around h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as View)}
                                aria-current={isActive ? 'page' : undefined}
                                className={`flex flex-col items-center justify-center w-full text-xs sm:text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md ${
                                    isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                                }`}
                            >
                                <Icon className="h-6 w-6 mb-1" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </nav>
      )}
    </div>
  );
};

export default Dashboard;