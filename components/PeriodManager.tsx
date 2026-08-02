import React, { useState, useEffect } from 'react';
import { useMealManager } from '../hooks/useMealManager';
import { Period } from '../types';
import Modal from './Modal';
import * as api from '../services/firebase';
import { generateArchivePdf } from '../utils/pdfGenerator';
import { useAuth } from '../hooks/useAuth';

const DownloadIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const PeriodManager: React.FC<{ mealManager: ReturnType<typeof useMealManager> }> = ({ mealManager }) => {
    const { currency } = useAuth();
    const { activePeriod, archiveAndStartNewPeriod, createFirstPeriod, updateActivePeriod } = mealManager;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [archivedPeriods, setArchivedPeriods] = useState<Period[]>([]);
    const [isLoadingArchives, setIsLoadingArchives] = useState(true);

    const [periodName, setPeriodName] = useState('');
    const [periodType, setPeriodType] = useState<'monthly' | 'weekly'>('monthly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [transferBalances, setTransferBalances] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchArchives = async () => {
            setIsLoadingArchives(true);
            try {
                const archives = await api.getArchivedPeriods();
                setArchivedPeriods(archives);
            } catch (error) {
                console.error("Failed to load archives:", error);
            } finally {
                setIsLoadingArchives(false);
            }
        };
        fetchArchives();
    }, [activePeriod]); // Refetch archives when a new period starts

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        const today = new Date();
        const year = today.getFullYear();
        const month = today.toLocaleString('default', { month: 'long' });
        
        setPeriodName(`${month} ${year}`);
        setStartDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]);
        setEndDate(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]);
        setTransferBalances(true);
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = () => {
        if (!activePeriod) return;
        setIsEditMode(true);
        setPeriodName(activePeriod.name);
        setPeriodType(activePeriod.type);
        setStartDate(activePeriod.startDate);
        setEndDate(activePeriod.endDate);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!periodName || !startDate || !endDate) {
            alert("Please fill in all fields for the period.");
            return;
        }
        setIsSubmitting(true);
        try {
            const periodData = { name: periodName, type: periodType, startDate, endDate };
            if (isEditMode) {
                await updateActivePeriod(periodData);
            } else if (activePeriod) {
                await archiveAndStartNewPeriod(periodData, transferBalances);
            } else {
                await createFirstPeriod(periodData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to manage period:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadPdf = async (archiveId: string) => {
        try {
            const archive = await api.getArchive(archiveId);
            generateArchivePdf(archive, currency);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Could not download the archive PDF. It may have been deleted or an error occurred.");
        }
    };
    
    const modalTitle = isEditMode
        ? "Edit Active Period"
        : (activePeriod ? "Archive & Start New Period" : "Create First Meal Period");
        
    const submitButtonText = isSubmitting
        ? 'Processing...'
        : (isEditMode ? 'Save Changes' : (activePeriod ? 'Archive & Start New' : 'Create Period'));

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Meal Period Management</h3>
                <button onClick={handleOpenCreateModal} className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors active:scale-95">
                    {activePeriod ? 'Archive & Start New' : 'Create First Period'}
                </button>
            </div>
            
             {activePeriod && (
                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 tracking-wider uppercase">Active Period</h4>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">{activePeriod.name}</p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {new Date(activePeriod.startDate).toLocaleDateString()} - {new Date(activePeriod.endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <button onClick={handleOpenEditModal} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full active:scale-95">
                            Edit Period
                        </button>
                    </div>
                </div>
            )}
            
            <div className="p-8">
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 tracking-wider uppercase">Archive History</h4>
                {isLoadingArchives ? (
                    <p className="text-sm font-medium text-slate-500">Loading archives...</p>
                ) : archivedPeriods.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800/60 -mx-8 px-8">
                        {archivedPeriods.map(p => (
                            <li key={p.id} className="py-4 flex justify-between items-center group">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                        {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => handleDownloadPdf(p.id)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full active:scale-95">
                                    <DownloadIcon className="h-4 w-4" />
                                    Download PDF
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No archived periods found.</p>
                )}
            </div>

            <Modal title={modalTitle} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activePeriod && !isEditMode && (
                        <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 text-amber-800 dark:text-amber-300 rounded-2xl">
                            <p className="font-bold text-base tracking-tight">You are about to archive the current period: "{activePeriod.name}".</p>
                            <p className="text-sm mt-1">This will save a final report and start a fresh period. This action cannot be undone.</p>
                        </div>
                    )}
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight mb-2">{isEditMode ? 'Edit Period Details' : 'New Period Details'}</h4>
                    <div>
                        <label htmlFor="periodName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Period Name</label>
                        <input id="periodName" type="text" value={periodName} onChange={e => setPeriodName(e.target.value)} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" placeholder="e.g., July 2024" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                            <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                            <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="periodType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Period Type</label>
                        <select id="periodType" value={periodType} onChange={e => setPeriodType(e.target.value as 'monthly' | 'weekly')} className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 sm:text-sm text-slate-900 dark:text-white transition-all appearance-none cursor-pointer">
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    {activePeriod && !isEditMode && (
                        <div className="flex items-start mt-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center h-6">
                                <input id="transferBalances" name="transferBalances" type="checkbox" checked={transferBalances} onChange={e => setTransferBalances(e.target.checked)} className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-slate-300 rounded cursor-pointer" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="transferBalances" className="font-bold text-slate-900 dark:text-white cursor-pointer select-none">Transfer Balances</label>
                                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Carry over final balances from the current period to the new one.</p>
                            </div>
                        </div>
                    )}
                    <div className="pt-6 flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-emerald-600 hover:bg-emerald-700 transition-colors active:scale-95 disabled:bg-emerald-400 disabled:active:scale-100">
                           {submitButtonText}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PeriodManager;