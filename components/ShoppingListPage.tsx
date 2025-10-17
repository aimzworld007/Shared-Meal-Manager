/**
 * @file ShoppingListPage.tsx
 * @summary A component for managing a collaborative, real-time shopping list.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingListItem } from '../types';
import { useMealManager } from '../hooks/useMealManager';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../hooks/useAuth';

interface ShoppingListPageProps {
    mealManager: ReturnType<typeof useMealManager>;
    onConvertToExpense: (fromShoppingList: { name: string, items: ShoppingListItem[] }) => void;
}

const DeleteIcon = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const ShoppingListPage: React.FC<ShoppingListPageProps> = ({ mealManager, onConvertToExpense }) => {
    const { user } = useAuth();
    const { shoppingList, addShoppingListItem, updateShoppingListItemStatus, deleteShoppingListItem, clearCompletedShoppingItems, members } = mealManager;
    const [newItemName, setNewItemName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<ShoppingListItem | null>(null);
    const addItemInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleFocus = () => addItemInputRef.current?.focus();
        window.addEventListener('focusAddItem', handleFocus);
        return () => window.removeEventListener('focusAddItem', handleFocus);
    }, []);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || isSubmitting) return;

        // Find the current user in the members list to get their name
        const member = members.find(m => m.name.toLowerCase() === user?.email?.split('@')[0].toLowerCase()) // A simple way to guess member name
        const addedBy = member?.name || user?.email || 'Someone';

        setIsSubmitting(true);
        try {
            await addShoppingListItem({
                name: newItemName.trim(),
                isComplete: false,
                addedAt: new Date().toISOString(),
                addedBy: addedBy
            });
            setNewItemName('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (item: ShoppingListItem) => {
        setItemToDelete(item);
        setIsConfirmOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            await deleteShoppingListItem(itemToDelete.id);
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };
    
    const handleConvertToExpense = () => {
        const completedItems = shoppingList.filter(item => item.isComplete);
        if (completedItems.length === 0) {
            alert("Please check off at least one item to convert it to an expense.");
            return;
        }

        const expenseName = completedItems.length > 1 ? `Market run (${completedItems.length} items)` : completedItems[0].name;
        onConvertToExpense({ name: expenseName, items: completedItems });
    };

    const { activeItems, completedItems } = useMemo(() => {
        const active: ShoppingListItem[] = [];
        const completed: ShoppingListItem[] = [];
        shoppingList.forEach(item => {
            if (item.isComplete) {
                completed.push(item);
            } else {
                active.push(item);
            }
        });
        active.sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        completed.sort((a,b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        return { activeItems: active, completedItems: completed };
    }, [shoppingList]);
    

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shared Shopping List</h1>

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <div className="p-6">
                    <form onSubmit={handleAddItem} className="flex gap-4">
                        <input
                            ref={addItemInputRef}
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Add an item... (e.g., Milk, Bread)"
                            className="flex-grow block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <button type="submit" disabled={isSubmitting || !newItemName.trim()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isSubmitting ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                </div>
                
                {activeItems.length > 0 && (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activeItems.map(item => (
                            <li key={item.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={item.isComplete}
                                        onChange={() => updateShoppingListItemStatus(item.id, !item.isComplete)}
                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-4"
                                    />
                                    <div>
                                        <p className="text-md font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Added by {item.addedBy} on {new Date(item.addedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteClick(item)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete Item">
                                    <DeleteIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                
                {shoppingList.length === 0 && (
                     <p className="text-center text-gray-500 dark:text-gray-400 py-6">Your shopping list is empty.</p>
                )}

                {completedItems.length > 0 && (
                    <div className="border-t dark:border-gray-700">
                        <h3 className="px-4 pt-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Completed</h3>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                             {completedItems.map(item => (
                                <li key={item.id} className="p-4 flex items-center justify-between opacity-60">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={item.isComplete}
                                            onChange={() => updateShoppingListItemStatus(item.id, !item.isComplete)}
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-4"
                                        />
                                        <div>
                                            <p className="text-md font-medium text-gray-900 dark:text-gray-100 line-through">{item.name}</p>
                                             <p className="text-xs text-gray-500 dark:text-gray-400">Added by {item.addedBy} on {new Date(item.addedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteClick(item)} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete Item">
                                        <DeleteIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {completedItems.length > 0 && (
                     <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 rounded-b-lg flex flex-wrap justify-end items-center gap-4">
                        <button onClick={clearCompletedShoppingItems} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                            Clear Completed
                        </button>
                        <button onClick={handleConvertToExpense} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                            Convert to Expense
                        </button>
                     </div>
                )}
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Item"
                message={`Are you sure you want to delete this item from the shopping list?`}
            />
        </div>
    );
};

export default ShoppingListPage;