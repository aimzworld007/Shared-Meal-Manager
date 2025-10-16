import React, { useState, useEffect } from 'react';
import { useMealManager } from '../hooks/useMealManager';
import { Period } from '../types';
import Modal from './Modal';
import * as api from '../services/firebase';
import { generateArchivePdf } from '../utils/pdfGenerator';

const PeriodManager: React.FC<{ mealManager: ReturnType<typeof useMealManager> }> = ({ mealManager }) => {
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
            generateArchivePdf(archive);
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
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 rounded-t-lg flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Meal Period Management</h3>
                <button onClick={handleOpenCreateModal} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                    {activePeriod ? 'Archive & Start New' : 'Create First Period'}
                </button>
            </div>
            
             {activePeriod && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Active Period</h4>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">{activePeriod.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(activePeriod.startDate).toLocaleDateString()} - {new Date(activePeriod.endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <button onClick={handleOpenEditModal} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                            Edit Period
                        </button>
                    </div>
                </div>
            )}
            
            <div className="p-6">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Archive History</h4>
                {isLoadingArchives ? (
                    <p className="text-sm text-gray-500">Loading archives...</p>
                ) : archivedPeriods.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {archivedPeriods.map(p => (
                            <li key={p.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-gray-200">{p.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => handleDownloadPdf(p.id)} className="text-sm text-indigo-600 hover:text-indigo-800">
                                    Download PDF
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No archived periods found.</p>
                )}
            </div>

            <Modal title={modalTitle} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activePeriod && !isEditMode && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300 rounded-md">
                            <p className="font-bold">You are about to archive the current period: "{activePeriod.name}".</p>
                            <p className="text-sm">This will save a final report and start a fresh period. This action cannot be undone.</p>
                        </div>
                    )}
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{isEditMode ? 'Edit Period Details' : 'New Period Details'}</h4>
                    <div>
                        <label htmlFor="periodName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Period Name</label>
                        <input id="periodName" type="text" value={periodName} onChange={e => setPeriodName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" placeholder="e.g., July 2024" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                            <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="periodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Period Type</label>
                        <select id="periodType" value={periodType} onChange={e => setPeriodType(e.target.value as 'monthly' | 'weekly')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    {activePeriod && !isEditMode && (
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input id="transferBalances" name="transferBalances" type="checkbox" checked={transferBalances} onChange={e => setTransferBalances(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="transferBalances" className="font-medium text-gray-700 dark:text-gray-300">Transfer Balances</label>
                                <p className="text-gray-500 dark:text-gray-400">Carry over final balances from the current period to the new one.</p>
                            </div>
                        </div>
                    )}
                    <div className="pt-2 flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                           {submitButtonText}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PeriodManager;