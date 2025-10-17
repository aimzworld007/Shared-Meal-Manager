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
                        icon: 'https://i.ibb.co/ycwhj9tt/logo.jpg',
                    });
                }
            });
        }
    };

    const triggerNotification = (title: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Task Reminder', {
                body: title,
                icon: 'https://i.ibb.co/ycwhj9tt/logo.jpg',
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reminders</h1>
            
            {notificationPermission !== 'granted' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-md">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                {notificationPermission === 'denied'
                                    ? 'You have blocked notifications. To get reminders, please enable them in your browser settings.'
                                    : 'Enable browser notifications to get timely reminders for your tasks.'
                                }
                            </p>
                            {notificationPermission === 'default' && (
                                <div className="mt-2 text-sm">
                                    <button onClick={requestNotificationPermission} className="font-medium text-yellow-700 hover:text-yellow-600 dark:text-yellow-200 dark:hover:text-yellow-100">
                                        Enable Notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Reminders */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 rounded-t-lg">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Upcoming</h3>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {upcoming.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-6">No upcoming reminders. Add one using the button below!</p>}
                    {upcoming.map(r => (
                        <li key={r.id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <button onClick={() => handleToggleComplete(r)} className="text-gray-400 hover:text-green-500 mr-4">
                                    <CircleIcon />
                                </button>
                                <div>
                                    <p className="text-md font-medium text-gray-900 dark:text-gray-100">{r.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(r.dueDate).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => onEditReminder(r)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit Reminder"><EditIcon /></button>
                                <button onClick={() => handleDeleteClick(r)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete Reminder"><DeleteIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Completed Reminders */}
            {completed.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 rounded-t-lg">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Completed</h3>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {completed.map(r => (
                            <li key={r.id} className="p-4 flex items-center justify-between opacity-60">
                                <div className="flex items-center">
                                    <button onClick={() => handleToggleComplete(r)} className="text-green-500 mr-4">
                                        <CheckCircleIcon />
                                    </button>
                                    <div>
                                        <p className="text-md font-medium text-gray-900 dark:text-gray-100 line-through">{r.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-through">{new Date(r.dueDate).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleDeleteClick(r)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete Reminder"><DeleteIcon /></button>
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