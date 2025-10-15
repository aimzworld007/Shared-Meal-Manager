/**
 * @file useMealManager.tsx
 * @summary A comprehensive custom hook to manage the state and logic for the meal sharing dashboard.
 * It handles fetching data from Firebase, state management for members, groceries, and deposits,
 * and computes derived data like financial summaries.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Member, GroceryItem, Deposit } from '../types';
import * as api from '../services/firebase';

export const useMealManager = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [groceries, setGroceries] = useState<GroceryItem[]>([]);
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches all necessary data (members, groceries, deposits) from the API.
     * Uses useCallback to prevent re-creation on every render.
     */
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [membersData, groceriesData, depositsData] = await Promise.all([
                api.getMembers(),
                api.getGroceries(),
                api.getDeposits(),
            ]);
            setMembers(membersData);
            setGroceries(groceriesData);
            setDeposits(depositsData);
        } catch (err: any) {
            console.error("Failed to fetch data:", err);
            setError("Could not load your data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data fetch on component mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Memoized Calculations for Summaries ---
    const totalDeposit = useMemo(() => deposits.reduce((sum, item) => sum + item.amount, 0), [deposits]);
    const totalExpense = useMemo(() => groceries.reduce((sum, item) => sum + item.amount, 0), [groceries]);
    const memberCount = useMemo(() => members.length, [members]);

    const balanceSummaries = useMemo(() => {
        return members.map(member => {
            const totalDeposit = deposits
                .filter(d => d.memberId === member.id)
                .reduce((sum, d) => sum + d.amount, 0);

            const memberExpense = groceries
                .filter(g => g.memberIds.includes(member.id))
                .reduce((sum, g) => sum + (g.amount / g.memberIds.length), 0);
            
            const balance = totalDeposit - memberExpense;

            return {
                ...member,
                totalDeposit,
                share: memberExpense,
                balance
            };
        });
    }, [members, deposits, groceries]);


    // --- CRUD Operations ---
    const handleApiCall = async (apiCall: Promise<any>) => {
        try {
            await apiCall;
            await fetchData();
        } catch (err) {
            console.error("API call failed:", err);
            setError("An operation failed. Please refresh and try again.");
        }
    };

    const addMember = (name: string) => handleApiCall(api.addMember({ name }));
    const updateMember = (id: string, name: string) => handleApiCall(api.updateMember(id, { name }));
    const deleteMember = (id: string) => handleApiCall(api.deleteMember(id));
    
    const addGrocery = (item: Omit<GroceryItem, 'id'>) => handleApiCall(api.addGrocery(item));
    const updateGrocery = (id: string, item: Omit<GroceryItem, 'id'>) => handleApiCall(api.updateGrocery(id, item));
    const deleteGrocery = (id: string) => handleApiCall(api.deleteGrocery(id));

    const addDeposit = (item: Omit<Deposit, 'id'>) => handleApiCall(api.addDeposit(item));
    const updateDeposit = (id: string, item: Omit<Deposit, 'id'>) => handleApiCall(api.updateDeposit(id, item));
    const deleteDeposit = (id: string) => handleApiCall(api.deleteDeposit(id));
    
    // --- Bulk Import Operations ---

    const onImportDeposits = async (items: { memberId: string; amount: number; date: string }[]) => {
        const promises = items.map(item => api.addDeposit(item));
        await handleApiCall(Promise.all(promises));
    };

    const onImportGroceries = async (items: { name: string; amount: number; date: string, memberIds: string[] }[]) => {
        const promises = items.map(item => api.addGrocery(item));
        await handleApiCall(Promise.all(promises));
    };

    return {
        loading, error, members, groceries, deposits,
        totalDeposit, totalExpense, memberCount, balanceSummaries,
        addMember, updateMember, deleteMember,
        addGrocery, updateGrocery, deleteGrocery,
        addDeposit, updateDeposit, deleteDeposit,
        onImportDeposits, onImportGroceries,
        refreshData: fetchData,
    };
};
