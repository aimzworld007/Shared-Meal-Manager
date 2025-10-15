import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/firebase';
import { GroceryItem, Deposit, Participant } from '../types';
import { useAuth } from './useAuth';

export const useMealManager = () => {
    const { user } = useAuth();
    const [groceries, setGroceries] = useState<GroceryItem[]>([]);
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch all data in parallel for efficiency
            const [groceriesData, depositsData, participantsData] = await Promise.all([
                api.getGroceries(user.uid),
                api.getDeposits(user.uid),
                api.getParticipants(),
            ]);
            setGroceries(groceriesData);
            setDeposits(depositsData);
            setParticipants(participantsData);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Could not load your meal data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // --- Memoized Calculations ---
    const balanceSummary = useMemo(() => {
        const totalSpentByCurrentUser = groceries.reduce((sum, item) => sum + item.amount, 0);
        const totalDepositedByCurrentUser = deposits.reduce((sum, item) => sum + item.amount, 0);
        
        // These calculations need to be based on ALL users' data for an accurate shared balance,
        // but for the user dashboard, we'll focus on their contributions.
        // A more complex system would fetch all groceries to calculate the total group expense.
        // For simplicity here, we assume the `participants` list is for calculating shares.
        const totalSharedExpense = groceries.reduce((sum, item) => sum + item.amount, 0); // This is simplified to current user's groceries
        const numberOfParticipants = participants.length > 0 ? participants.length : 1;
        const individualShare = totalSharedExpense / numberOfParticipants;
        const personalBalance = totalDepositedByCurrentUser - individualShare;

        return {
            totalSpent: totalSpentByCurrentUser,
            totalDeposited: totalDepositedByCurrentUser,
            individualShare,
            personalBalance,
            numberOfParticipants,
        };
    }, [groceries, deposits, participants]);

    // --- CRUD Functions ---
    const addGroceryItem = async (item: Omit<GroceryItem, 'id' | 'purchaserId'>) => {
        if (!user) return;
        try {
            await api.addGrocery(user.uid, { ...item, purchaserId: user.uid });
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error adding grocery:", error);
            setError("Failed to add grocery item.");
            throw error;
        }
    };

    const addMultipleGroceryItems = async (items: Omit<GroceryItem, 'id' | 'purchaserId'>[]) => {
        if (!user) return;
        try {
            const promises = items.map(item => api.addGrocery(user.uid, { ...item, purchaserId: user.uid }));
            await Promise.all(promises);
            fetchData(); // Refresh data once after all items are added
        } catch (error) {
            console.error("Error adding multiple grocery items:", error);
            setError("Failed to import grocery items.");
            throw error;
        }
    };

    const deleteGroceryItem = async (itemId: string) => {
        if (!user) return;
        try {
            await api.deleteGrocery(user.uid, itemId);
            fetchData();
        } catch (error) {
            console.error("Error deleting grocery:", error);
            setError("Failed to delete grocery item.");
            throw error;
        }
    };

    const addDepositItem = async (item: Omit<Deposit, 'id' | 'userId'>) => {
        if (!user) return;
        try {
            await api.addDeposit(user.uid, { ...item, userId: user.uid });
            fetchData();
        } catch (error) {
            console.error("Error adding deposit:", error);
            setError("Failed to add deposit.");
            throw error;
        }
    };

    const deleteDepositItem = async (depositId: string) => {
        if (!user) return;
        try {
            await api.deleteDeposit(user.uid, depositId);
            fetchData();
        } catch (error) {
            console.error("Error deleting deposit:", error);
            setError("Failed to delete deposit.");
            throw error;
        }
    };


    return {
        loading,
        error,
        groceries,
        deposits,
        participants,
        balanceSummary,
        addGroceryItem,
        addMultipleGroceryItems,
        deleteGroceryItem,
        addDepositItem,
        deleteDepositItem,
        refreshData: fetchData,
    };
};