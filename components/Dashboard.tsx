/**
 * @file Dashboard.tsx
 * @summary The main user dashboard, displaying all meal and expense data for the logged-in user.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../App';
import { useMealManager } from '../hooks/useMealManager';
import GroceryManager from './GroceryManager';
import PermissionsError from './PermissionsError';
import SettingsPage from './SettingsPage';
import SpendChart from './MonthlySpendChart';
import FAB from './FAB';
import SummaryCircle from './SummaryCircle';
import Modal from './Modal';
import AccountsView from './AccountsView';
import BalanceOverview from './BalanceOverview';
import RemindersPage from './RemindersPage';
import { GroceryItem, Deposit, Reminder } from '../types';
import { logoUrl as defaultLogoUrl } from '../assets/logo';
import { formatCurrency } from '../utils/formatters';

// Define view types for bottom navigation
type View = 'home' | 'grocery' | 'accounts' | 'reminders' | 'settings';

// --- Icon Components ---
const HomeIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
const ReminderIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);
const SettingsIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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

interface DashboardProps {
  logoUrl?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ logoUrl }) => {
  const { user, logout, currency } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const mealManager = useMealManager();
  const [view, setView] = useState<View>('home');
  
  // State for modals
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
  const [editingGrocery, setEditingGrocery] = useState<GroceryItem | null>(null);
  const [groceryForm, setGroceryForm] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0], purchaserId: '' });
  
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [depositForm, setDepositForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], userId: '', notes: '' });

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderForm, setReminderForm] = useState({ title: '', dueDate: '' });


  const { members, activePeriod, isPeriodLoading } = mealManager;
  const designatedMealManager = members.find(m => m.isMealManager);

  const openGroceryModal = (item: GroceryItem | null = null) => {
    if (members.length === 0) {
      alert("Please add a member first before adding an expense.");
      return;
    }
    if (item) {
        setEditingGrocery(item);
        setGroceryForm({ name: item.name, amount: item.amount.toString(), date: item.date, purchaserId: item.purchaserId });
    } else {
        setEditingGrocery(null);
        setGroceryForm({ name: '', amount: '', date: new Date().toISOString().split('T')[0], purchaserId: members[0].id });
    }
    setIsGroceryModalOpen(true);
  };
  
  const handleGrocerySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const data = {
              name: groceryForm.name,
              amount: parseFloat(groceryForm.amount),
              date: groceryForm.date,
              purchaserId: groceryForm.purchaserId
          };
          if (editingGrocery) {
              await mealManager.updateGroceryItem(editingGrocery.id, data);
          } else {
              await mealManager.addGroceryItem(data);
          }
          setIsGroceryModalOpen(false);
      } catch (err) { console.error(err); }
  };
  
  const openDepositModal = (item: Deposit | null = null) => {
    if (members.length === 0) {
      alert("Please add a member first before adding a deposit.");
      return;
    }
    if (item) {
        setEditingDeposit(item);
        setDepositForm({ amount: item.amount.toString(), date: item.date, userId: item.userId, notes: item.notes || '' });
    } else {
        setEditingDeposit(null);
        setDepositForm({ amount: '', date: new Date().toISOString().split('T')[0], userId: members[0].id, notes: '' });
    }
    setIsDepositModalOpen(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
           const data = {
              amount: parseFloat(depositForm.amount),
              date: depositForm.date,
              userId: depositForm.userId,
              notes: depositForm.notes,
          };
          if (editingDeposit) {
              await mealManager.updateDepositItem(editingDeposit.id, data);
          } else {
              await mealManager.addDepositItem(data);
          }
          setIsDepositModalOpen(false);
      } catch(err) { console.error(err); }
  };

  const openReminderModal = (item: Reminder | null = null) => {
    if (item) {
        setEditingReminder(item);
        // Format date for datetime-local input
        const localDate = new Date(item.dueDate).toISOString().slice(0, 16);
        setReminderForm({ title: item.title, dueDate: localDate });
    } else {
        setEditingReminder(null);
        setReminderForm({ title: '', dueDate: '' });
    }
    setIsReminderModalOpen(true);
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const data = {
            title: reminderForm.title,
            dueDate: new Date(reminderForm.dueDate).toISOString(),
        };
        if (editingReminder) {
            await mealManager.updateReminderItem(editingReminder.id, data);
        } else {
            await mealManager.addReminderItem({ ...data, isComplete: false, createdAt: new Date().toISOString() });
        }
        setIsReminderModalOpen(false);
    } catch(err) { console.error(err); }
  };

  const renderView = () => {
    if (isPeriodLoading) {
        return (
            <div className="flex-grow flex items-center justify-center">
                 <p className="text-gray-600 dark:text-gray-400">Loading period data...</p>
            </div>
        );
    }

    if (!activePeriod && !['settings', 'reminders'].includes(view)) {
        return <SettingsPage mealManager={mealManager} />;
    }

    if (mealManager.loading && view !== 'settings') {
        return (
            <div className="flex-grow flex items-center justify-center">
                 <p className="text-gray-600 dark:text-gray-400">Loading meal data...</p>
            </div>
        );
    }
    
    if (mealManager.error?.includes('Permission Denied')) {
        return <PermissionsError errorMessage={mealManager.error} onRetry={mealManager.refreshData} />;
    }
      
    switch (view) {
      case 'home':
        return <HomeView />;
      case 'grocery':
        return <GroceryManager 
                    groceries={mealManager.summary.allGroceries} 
                    members={members}
                    activePeriod={activePeriod}
                    onEditGrocery={openGroceryModal}
                    onDeleteGrocery={mealManager.deleteGroceryItem}
                    onNavigateToAccounts={() => setView('accounts')}
                    averageExpense={mealManager.summary.averageExpense}
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
                />;
      case 'accounts':
        return <AccountsView mealManager={mealManager} onEditDeposit={openDepositModal} />;
      case 'reminders':
        return <RemindersPage 
                    reminders={mealManager.reminders} 
                    onEditReminder={openReminderModal}
                    onUpdateReminder={mealManager.updateReminderItem}
                    onDeleteReminder={mealManager.deleteReminderItem}
                />;
      case 'settings':
        return <SettingsPage mealManager={mealManager} />;
      default:
        return <HomeView />;
    }
  };

  const HomeView: React.FC = () => {
      const { summary, activePeriod } = mealManager;
      const [currentDateTime, setCurrentDateTime] = useState(new Date());

      useEffect(() => {
        const timerId = setInterval(() => setCurrentDateTime(new Date()), 1000);
        return () => clearInterval(timerId); // Cleanup interval on component unmount
      }, []);

      const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
      };
      
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString();
      };

      return (
          <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 text-center transition-all duration-300 hover:shadow-md">
                <p className="text-lg font-medium text-slate-500 dark:text-slate-400">{formatDate(currentDateTime)}</p>
                <p className="text-6xl font-extrabold text-slate-900 dark:text-white my-3 tracking-tight">{formatTime(currentDateTime)}</p>
                {activePeriod && (
                    <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-4 py-1.5 rounded-full">
                        Running Period: <span className="font-bold">{activePeriod.name}</span>
                    </p>
                )}
              </div>
              <BalanceOverview members={summary.members} onViewDetails={() => setView('accounts')} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SummaryCircle title="Total Members" value={summary.totalMembers.toString()} colorClassName="bg-blue-500" />
                  <SummaryCircle title="Total Grocery Cost" value={formatCurrency(summary.totalGroceryCost, currency)} colorClassName="bg-red-500" />
                  <SummaryCircle title="Total Deposits" value={formatCurrency(summary.totalDeposits, currency)} colorClassName="bg-green-500" />
                  <SummaryCircle title="Avg. Expense/Person" value={formatCurrency(summary.averageExpense, currency)} colorClassName="bg-yellow-500" />
              </div>
              <SpendChart groceries={summary.allGroceries} />
          </div>
      );
  };
  
  const navItems = [
      { name: 'home', Icon: HomeIcon, requiresPeriod: true }, 
      { name: 'grocery', Icon: GroceryIcon, requiresPeriod: true },
      { name: 'accounts', Icon: AccountsIcon, requiresPeriod: true },
      { name: 'reminders', Icon: ReminderIcon, requiresPeriod: false },
      { name: 'settings', Icon: SettingsIcon, requiresPeriod: false }
  ];


  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src={logoUrl || defaultLogoUrl} alt="Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white ml-3 tracking-tight">Meal Manager</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>
              <button onClick={logout} className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors active:scale-95">
                <LogoutIcon />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 pb-24">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 pb-safe">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-5 h-16">
            {navItems.map(item => (
                <button
                    key={item.name}
                    onClick={() => setView(item.name as View)}
                    disabled={!activePeriod && item.requiresPeriod}
                    className={`flex flex-col items-center justify-center w-full text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 ${
                        view === item.name ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    } ${!activePeriod && item.requiresPeriod ? 'opacity-40 cursor-not-allowed active:scale-100' : ''}`}
                >
                    <div className={`p-1.5 rounded-full transition-colors mb-0.5 ${view === item.name ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                      <item.Icon className="h-6 w-6" />
                    </div>
                    <span className="capitalize">{item.name}</span>
                </button>
            ))}
          </div>
        </div>
      </nav>

      <FAB
        onAddExpense={openGroceryModal}
        onAddDeposit={openDepositModal}
        onAddReminder={openReminderModal}
      />

      {/* Grocery Modal */}
      <Modal title={editingGrocery ? "Edit Expense" : "Add New Expense"} isOpen={isGroceryModalOpen} onClose={() => setIsGroceryModalOpen(false)}>
        <form onSubmit={handleGrocerySubmit} className="space-y-4">
           <div>
              <label htmlFor="purchaser" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purchased By</label>
               <select id="purchaser" value={groceryForm.purchaserId} onChange={(e) => setGroceryForm({...groceryForm, purchaserId: e.target.value})} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all appearance-none cursor-pointer">
                {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
           </div>
           <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input type="date" id="date" value={groceryForm.date} onChange={(e) => setGroceryForm({...groceryForm, date: e.target.value})} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
           </div>
           <div>
             <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
             <input type="text" id="name" value={groceryForm.name} onChange={(e) => setGroceryForm({...groceryForm, name: e.target.value})} required placeholder="e.g., Rice, Vegetables" className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
           </div>
           <div>
             <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ({currency})</label>
             <input type="number" id="amount" value={groceryForm.amount} onChange={(e) => setGroceryForm({...groceryForm, amount: e.target.value})} required min="0.01" step="0.01" placeholder="e.g., 55.50" className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
           </div>
           <div className="pt-4 flex justify-end">
             <button type="submit" className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95">
                {editingGrocery ? "Update Expense" : "Add Expense"}
             </button>
           </div>
        </form>
      </Modal>
      
      {/* Deposit Modal */}
      <Modal title={editingDeposit ? "Edit Deposit" : "Add New Deposit"} isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)}>
        <form onSubmit={handleDepositSubmit} className="space-y-4">
           <div>
              <label htmlFor="user" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Member</label>
               <select id="user" value={depositForm.userId} onChange={(e) => setDepositForm({...depositForm, userId: e.target.value})} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all appearance-none cursor-pointer">
                {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
           </div>
           <div>
              <label htmlFor="deposit_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input type="date" id="deposit_date" value={depositForm.date} onChange={(e) => setDepositForm({...depositForm, date: e.target.value})} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
           </div>
            <div>
             <label htmlFor="deposit_amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ({currency})</label>
             <input type="number" id="deposit_amount" value={depositForm.amount} onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})} required min="0.01" step="0.01" placeholder="e.g., 200.00" className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
           </div>
           <div>
             <label htmlFor="deposit_notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
             <input type="text" id="deposit_notes" value={depositForm.notes} onChange={(e) => setDepositForm({...depositForm, notes: e.target.value})} placeholder="e.g., Balance transfer" className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
           </div>
           <div className="pt-4 flex justify-end">
             <button type="submit" className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95">
                {editingDeposit ? "Update Deposit" : "Add Deposit"}
             </button>
           </div>
        </form>
      </Modal>

       {/* Reminder Modal */}
       <Modal title={editingReminder ? "Edit Reminder" : "Add New Reminder"} isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)}>
        <form onSubmit={handleReminderSubmit} className="space-y-4">
           <div>
             <label htmlFor="reminder_title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
             <input type="text" id="reminder_title" value={reminderForm.title} onChange={(e) => setReminderForm({...reminderForm, title: e.target.value})} required placeholder="e.g., Pay electricity bill" className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
           </div>
           <div>
              <label htmlFor="reminder_dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date & Time</label>
              <input type="datetime-local" id="reminder_dueDate" value={reminderForm.dueDate} onChange={(e) => setReminderForm({...reminderForm, dueDate: e.target.value})} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
           </div>
           <div className="pt-4 flex justify-end">
             <button type="submit" className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-colors active:scale-95">
                {editingReminder ? "Update Reminder" : "Add Reminder"}
             </button>
           </div>
        </form>
      </Modal>

    </div>
  );
};

export default Dashboard;