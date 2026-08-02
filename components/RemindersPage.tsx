/**
 * @file RemindersPage.tsx
 * @summary A component for managing and displaying task reminders with browser notifications.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Reminder } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface RemindersPageProps {
    reminders: Reminder[];
    onEditReminder: (reminder: Reminder) => void;
    onUpdateReminder: (reminderId: string, data: Partial<Omit<Reminder, 'id'>>) => Promise<void>;
    onDeleteReminder: (reminderId: string) => Promise<void>;
}

// --- Icons ---
const CheckCircleIcon = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const CircleIcon = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const EditIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);
const DeleteIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const RemindersPage: React.FC<RemindersPageProps> = ({ reminders, onEditReminder, onUpdateReminder, onDeleteReminder }) => {
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [itemToDelete, setItemToDelete] = useState<Reminder | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const scheduledNotifications = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }

        // --- Notification Scheduling Effect ---
        const timeouts = scheduledNotifications.current;
        // Clear all previous timeouts
        timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        timeouts.clear();

        reminders.forEach(reminder => {
            if (!reminder.isComplete) {
                const dueDate = new Date(reminder.dueDate).getTime();
                const now = Date.now();
                const delay = dueDate - now;

                if (delay > 0) {
                    const timeoutId = window.setTimeout(() => {
                        triggerNotification(reminder.title);
                    }, delay);
                    timeouts.set(reminder.id, timeoutId);
                }
            }
        });

        return () => {
            // Cleanup on unmount
            timeouts.forEach(timeoutId => clearTimeout(timeoutId));
        };
    }, [reminders]);

    const requestNotificationPermission = () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                setNotificationPermission(permission);
                if (permission === 'granted') {
                    new Notification('Notifications Enabled!', {
                        body: 'You will now receive reminders for your tasks.',
                        icon: '/logo.jpg',
                    });
                }
            });
        }
    };

    const triggerNotification = (title: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Task Reminder', {
                body: title,
                icon: '/logo.jpg',
            });
        }
    };
    
    const handleToggleComplete = (reminder: Reminder) => {
        onUpdateReminder(reminder.id, { isComplete: !reminder.isComplete });
    };

    const handleDeleteClick = (reminder: Reminder) => {
        setItemToDelete(reminder);
        setIsConfirmOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (itemToDelete) {
          await onDeleteReminder(itemToDelete.id);
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const { upcoming, completed } = useMemo(() => {
        const upcoming: Reminder[] = [];
        const completed: Reminder[] = [];
        reminders.forEach(r => {
            if (r.isComplete) {
                completed.push(r);
            } else {
                upcoming.push(r);
            }
        });
        // Sort completed by due date descending
        completed.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        return { upcoming, completed };
    }, [reminders]);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Reminders</h1>
            
            {notificationPermission !== 'granted' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-2xl">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                                {notificationPermission === 'denied'
                                    ? 'You have blocked notifications. To get reminders, please enable them in your browser settings.'
                                    : 'Enable browser notifications to get timely reminders for your tasks.'
                                }
                            </p>
                            {notificationPermission === 'default' && (
                                <div className="mt-3 text-sm">
                                    <button onClick={requestNotificationPermission} className="font-bold text-amber-700 hover:text-amber-800 dark:text-amber-200 dark:hover:text-amber-100 transition-colors bg-amber-100 dark:bg-amber-800/30 px-4 py-2 rounded-full">
                                        Enable Notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Reminders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Upcoming</h3>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {upcoming.length === 0 && <p className="text-center text-slate-500 dark:text-slate-400 py-10 font-medium">No upcoming reminders. Add one using the button below!</p>}
                    {upcoming.map(r => (
                        <li key={r.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <div className="flex items-center">
                                <button onClick={() => handleToggleComplete(r)} className="text-slate-400 hover:text-emerald-500 dark:text-slate-500 dark:hover:text-emerald-400 mr-5 transition-colors">
                                    <CircleIcon className="h-7 w-7" />
                                </button>
                                <div>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{r.title}</p>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{new Date(r.dueDate).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onEditReminder(r)} className="p-2.5 rounded-full text-indigo-500 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors active:scale-95" title="Edit Reminder"><EditIcon /></button>
                                <button onClick={() => handleDeleteClick(r)} className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors active:scale-95" title="Delete Reminder"><DeleteIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Completed Reminders */}
            {completed.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Completed</h3>
                    </div>
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {completed.map(r => (
                            <li key={r.id} className="p-6 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex items-center">
                                    <button onClick={() => handleToggleComplete(r)} className="text-emerald-500 mr-5 transition-colors">
                                        <CheckCircleIcon className="h-7 w-7" />
                                    </button>
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white line-through">{r.title}</p>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-through">{new Date(r.dueDate).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleDeleteClick(r)} className="p-2.5 rounded-full text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors active:scale-95" title="Delete Reminder"><DeleteIcon /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
             <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Reminder"
                message={`Are you sure you want to permanently delete this reminder?`}
            />
        </div>
    );
};

export default RemindersPage;