/**
 * @file Dashboard.tsx
 * @summary The main user dashboard, displaying all meal and expense data for the logged-in user.
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../App';
import { useMealManager } from '../hooks/useMealManager';
import GroceryManager from './GroceryManager';
import PermissionsError from './PermissionsError';
import SettingsPage from './SettingsPage';
import MonthlySpendChart from './MonthlySpendChart';
import FAB from './FAB';
import SummaryCircle from './SummaryCircle';
import Modal from './Modal';
import AccountsView from './AccountsView';
import { GroceryItem, Deposit } from '../types';
import { logoUrl as defaultLogoUrl } from '../assets/logo';

// Define view types for bottom navigation
type View = 'home' | 'grocery' | 'accounts' | 'settings';

// --- Icon Components ---
const HomeIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const GroceryIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const AccountsIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const SettingsIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const LogoutIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);
const SunIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const MoonIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(amount);
};

const Dashboard: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => {
  const [activeTab, setActiveTab] = useState<View>('home');
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const mealManager = useMealManager();

  const { loading, error, summary, members, groceries, refreshData } = mealManager;
  const isPermissionError = error && error.includes('Permission Denied');

  // --- State for Grocery Modal ---
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<GroceryItem | null>(null);
  const [isSubmittingGrocery, setIsSubmittingGrocery] = useState(false);
  const [groceryName, setGroceryName] = useState('');
  const [groceryAmount, setGroceryAmount] = useState('');
  const [groceryDate, setGroceryDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaserId, setPurchaserId] = useState('');
  
  // --- State for Deposit Modal ---
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedUserIdForDeposit, setSelectedUserIdForDeposit] = useState('');

  // --- Grocery Modal Handlers ---
  const openAddGroceryModal = () => {
    if (members.length === 0) {
        alert("Please add a member in Settings before adding an expense.");
        return;
    }
    setItemToEdit(null);
    setGroceryName('');
    setGroceryAmount('');
    setGroceryDate(new Date().toISOString().split('T')[0]);
    setPurchaserId(members[0].id);
    setIsGroceryModalOpen(true);
  };

  const openEditGroceryModal = (item: GroceryItem) => {
    setItemToEdit(item);
    setGroceryName(item.name);
    setGroceryAmount(String(item.amount));
    setGroceryDate(new Date(item.date).toISOString().split('T')[0]);
    setPurchaserId(item.purchaserId);
    setIsGroceryModalOpen(true);
  };
  
  const handleGrocerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groceryName || !groceryAmount || !groceryDate || !purchaserId || isSubmittingGrocery) return;
    setIsSubmittingGrocery(true);
    
    const groceryData = { name: groceryName, amount: parseFloat(groceryAmount), date: groceryDate, purchaserId };
    
    try {
      if (itemToEdit) {
        await mealManager.updateGroceryItem(itemToEdit.id, groceryData);
      } else {
        await mealManager.addGroceryItem(groceryData);
      }
      setIsGroceryModalOpen(false);
    } catch(error) { /* Handled by hook */ } 
    finally { setIsSubmittingGrocery(false); }
  };

  // --- Deposit Modal Handlers ---
  const openAddDepositModal = () => {
    if (members.length === 0) {
        alert("Please add a member in Settings before adding a deposit.");
        return;
    }
    setEditingDeposit(null);
    setSelectedUserIdForDeposit(members[0].id);
    setDepositAmount('');
    setDepositDate(new Date().toISOString().split('T')[0]);
    setIsDepositModalOpen(true);
  };

  const openEditDepositModal = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setSelectedUserIdForDeposit(deposit.userId);
    setDepositAmount(String(deposit.amount));
    setDepositDate(new Date(deposit.date).toISOString().split('T')[0]);
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !depositDate || !selectedUserIdForDeposit || isSubmittingDeposit) return;
    setIsSubmittingDeposit(true);
    
    const depositData = { amount: parseFloat(depositAmount), date: depositDate, userId: selectedUserIdForDeposit };

    try {
      if (editingDeposit) {
        await mealManager.updateDepositItem(editingDeposit.id, depositData);
      } else {
        await mealManager.addDepositItem(depositData);
      }
      setIsDepositModalOpen(false);
    } catch (error) { /* Handled by hook */ } 
    finally { setIsSubmittingDeposit(false); }
  };

  const DashboardContent = () => (
    <>
      {loading && <p className="text-center text-gray-600 dark:text-gray-400">Loading your dashboard...</p>}
      {isPermissionError && <PermissionsError errorMessage={error} onRetry={refreshData} />}
      {!isPermissionError && error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-4 rounded-md">{error}</p>}
      {!loading && !error && (
        <div className="space-y-8">
          {activeTab === 'home' && (
            <div className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <SummaryCircle title="Total Grocery Spend" value={formatCurrency(summary.totalGroceryCost)} colorClassName="bg-red-500" />
                    <SummaryCircle title="Total Deposits" value={formatCurrency(summary.totalDeposits)} colorClassName="bg-green-500" />
                    <SummaryCircle title="Avg. Expense / Person" value={formatCurrency(summary.averageExpense)} colorClassName="bg-blue-500" />
                </div>
                <MonthlySpendChart groceries={groceries} />
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Member Balances</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {summary.members.map(member => (
                            <li key={member.id} className="py-3 flex justify-between items-center">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{member.name}</span>
                                <span className={`font-semibold text-lg ${member.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {formatCurrency(member.balance)}
                                </span>
                            </li>
                        ))}
                         {summary.members.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No members to show.</p>}
                    </ul>
                </div>
            </div>
          )}
          {activeTab === 'grocery' && (
            <GroceryManager
              groceries={summary.allGroceries}
              members={members}
              onEditGrocery={openEditGroceryModal}
              onDeleteGrocery={mealManager.deleteGroceryItem}
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
          {activeTab === 'accounts' && <AccountsView mealManager={mealManager} onEditDeposit={openEditDepositModal} />}
          {activeTab === 'settings' && <SettingsPage mealManager={mealManager} />}
        </div>
      )}
    </>
  );

  const navItems = [
      { id: 'home', label: 'Home', icon: HomeIcon },
      { id: 'grocery', label: 'Grocery Bill', icon: GroceryIcon },
      { id: 'accounts', label: 'Accounts', icon: AccountsIcon },
      { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
          <img src={logoUrl || defaultLogoUrl} alt="Logo" className="h-10" />
           <div className="flex items-center gap-4">
               <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Welcome, {user?.email}</span>
                <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
               <button onClick={logout} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-label="Logout">
                   <LogoutIcon />
               </button>
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 pb-24">
         <DashboardContent />
      </main>

        <>
        {activeTab === 'home' && <FAB onAddExpense={openAddGroceryModal} onAddDeposit={openAddDepositModal} />}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-t-lg z-20">
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
                                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
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
      </>

       {/* Grocery Add/Edit Modal */}
      <Modal title={itemToEdit ? "Edit Expense" : "Add New Expense"} isOpen={isGroceryModalOpen} onClose={() => setIsGroceryModalOpen(false)}>
        <form onSubmit={handleGrocerySubmit} className="space-y-4">
           <div>
              <label htmlFor="purchaser" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purchased By</label>
               <select id="purchaser" value={purchaserId} onChange={(e) => setPurchaserId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
           </div>
           <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input type="date" id="date" value={groceryDate} onChange={(e) => setGroceryDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
           </div>
           <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Name / Notes</label>
              <input type="text" id="name" value={groceryName} onChange={(e) => setGroceryName(e.target.value)} required placeholder="e.g., Milk, Bread, etc." className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
           </div>
           <div>
             <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (AED)</label>
             <input type="number" id="amount" value={groceryAmount} onChange={(e) => setGroceryAmount(e.target.value)} required min="0.01" step="0.01" placeholder="e.g., 25.50" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
           </div>
           <div className="pt-2 flex justify-end">
             <button type="submit" disabled={isSubmittingGrocery || members.length === 0} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                {isSubmittingGrocery ? 'Saving...' : (itemToEdit ? 'Save Changes' : 'Add Expense')}
             </button>
           </div>
        </form>
      </Modal>

      {/* Deposit Add/Edit Modal */}
      <Modal title={editingDeposit ? `Edit or Transfer Deposit` : `Add Deposit`} isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)}>
        <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <label htmlFor="deposit_member" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member</label>
              <select id="deposit_member" value={selectedUserIdForDeposit} onChange={(e) => setSelectedUserIdForDeposit(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </div>
           <div>
              <label htmlFor="deposit_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input type="date" id="deposit_date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600" />
           </div>
           <div>
             <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (AED)</label>
             <input type="number" id="deposit_amount" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required min="0.01" step="0.01" placeholder="e.g., 200.00" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" />
           </div>
           <div className="pt-2 flex justify-end">
             <button type="submit" disabled={isSubmittingDeposit} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                {isSubmittingDeposit ? 'Saving...' : (editingDeposit ? 'Save Changes' : 'Add Deposit')}
             </button>
           </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;