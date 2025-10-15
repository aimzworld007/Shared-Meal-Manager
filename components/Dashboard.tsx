/**
 * @file Dashboard.tsx
 * @summary The main view for authenticated users, displaying meal sharing data and management tools.
 * It acts as a container for all the feature components like summaries, member management, etc.
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMealManager } from '../hooks/useMealManager';
import { SummaryCard } from './SummaryCard';
import { BalanceSummary } from './BalanceSummary';
import { ParticipantManager } from './ParticipantManager';
import { GroceryManager } from './GroceryManager';
import { DepositManager } from './DepositManager';
import AdminDashboard from './AdminDashboard';
import CSVImportModal from './CSVImportModal';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const {
        loading, error, members, groceries, deposits, totalDeposit, totalExpense, memberCount,
        balanceSummaries, addMember, updateMember, deleteMember, addGrocery, updateGrocery, deleteGrocery,
        addDeposit, updateDeposit, deleteDeposit, onImportDeposits, onImportGroceries
    } = useMealManager();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    // Simple check to render Admin view. In a real app, this would be based on user roles from your DB.
    const isAdmin = user?.email === "admin@example.com"; // Replace with env var in a real app
    
    const renderContent = () => {
        if (loading) {
            return <div className="text-center py-10">Loading your meal data...</div>;
        }
        if (error) {
            return <div className="text-center py-10 text-red-600">{error}</div>;
        }

        if (isAdmin && activeTab === 'admin') {
            return <AdminDashboard />;
        }

        return (
            <div className="space-y-8">
                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard title="Total Expense" value={totalExpense} isCurrency />
                    <SummaryCard title="Total Deposits" value={totalDeposit} isCurrency />
                    <SummaryCard title="Team Members" value={memberCount} />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <GroceryManager groceries={groceries} members={members} addGrocery={addGrocery} updateGrocery={updateGrocery} deleteGrocery={deleteGrocery} />
                        <DepositManager deposits={deposits} members={members} addDeposit={addDeposit} updateDeposit={updateDeposit} deleteDeposit={deleteDeposit} />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <BalanceSummary summaries={balanceSummaries} />
                        <ParticipantManager members={members} addMember={addMember} updateMember={updateMember} deleteMember={deleteMember} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Meal Manager</h1>
                        <p className="text-sm text-gray-500">Welcome, {user?.email}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAdmin && (
                             <button onClick={() => setActiveTab(t => t === 'admin' ? 'dashboard' : 'admin')} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                {activeTab === 'admin' ? 'View User Dashboard' : 'View Admin Panel'}
                            </button>
                        )}
                        <button onClick={() => setIsImportModalOpen(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Import CSV
                        </button>
                        <button onClick={logout} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </main>
            <CSVImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                members={members}
                onImportDeposits={onImportDeposits}
                onImportGroceries={onImportGroceries}
            />
        </div>
    );
};

export default Dashboard;
