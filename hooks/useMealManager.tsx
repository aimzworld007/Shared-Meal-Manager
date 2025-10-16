import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/firebase';
import { UserDataSummary } from '../services/firebase';
import { GroceryItem, Deposit, Participant, Member } from '../types';

export const useMealManager = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allData, setAllData] = useState<UserDataSummary[]>([]);
    const [members, setMembers] = useState<Participant[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [data, membersData] = await Promise.all([
                api.fetchAllUsersData(),
                api.getMembers()
            ]);
            setAllData(data);
            setMembers(membersData);
        } catch (err: any) {
            console.error("Failed to fetch admin data:", err);
            if (err.code === 'permission-denied') {
                setError("Permission Denied: Could not load all user data. Please check your Firestore security rules to ensure the logged-in admin has permission to read all user collections and documents.");
            } else {
                setError("Could not load all meal data. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // --- Memoized Calculations ---
    const summary = useMemo(() => {
        const allGroceries = allData.flatMap(d => d.groceries);
        const totalGroceryCost = allGroceries.reduce((sum, item) => sum + item.amount, 0);
        
        const allDeposits = allData.flatMap(d => d.deposits);
        const totalDeposits = allDeposits.reduce((sum, item) => sum + item.amount, 0);

        const memberCount = members.length > 0 ? members.length : 1;
        const averageExpense = totalGroceryCost / memberCount;

        const memberData: Member[] = members.map(member => {
            const userData = allData.find(d => d.userId === member.id);
            const totalPurchase = userData?.groceries.reduce((sum, item) => sum + item.amount, 0) ?? 0;
            const totalDeposit = userData?.deposits.reduce((sum, item) => sum + item.amount, 0) ?? 0;
            const balance = (totalPurchase + totalDeposit) - averageExpense;
            return {
                ...member,
                totalPurchase,
                totalDeposit,
                balance,
            };
        });

        return {
            totalMembers: members.length,
            totalGroceryCost,
            totalDeposits,
            averageExpense,
            members: memberData,
            allGroceries: allData.flatMap(d => d.groceries.map(g => ({...g, purchaserEmail: d.userEmail}))).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            allDeposits: allData.flatMap(d => d.deposits.map(dep => ({...dep, userEmail: d.userEmail}))).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
    }, [allData, members]);

    // --- CRUD Functions ---
    const addGroceryItem = async (item: Omit<GroceryItem, 'id'>) => {
        try {
            await api.addGrocery(item.purchaserId, item);
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error adding grocery:", error);
            setError("Failed to add grocery item.");
            throw error;
        }
    };
    
    const addMultipleGroceryItems = async (items: Omit<GroceryItem, 'id'>[], memberId: string) => {
        if (!memberId) return;
        try {
            const promises = items.map(item => api.addGrocery(memberId, { ...item, purchaserId: memberId }));
            await Promise.all(promises);
            fetchData();
        } catch (error) {
            console.error("Error adding multiple grocery items:", error);
            setError("Failed to import grocery items.");
            throw error;
        }
    };

    const deleteGroceryItem = async (item: GroceryItem) => {
        try {
            await api.deleteGrocery(item.purchaserId, item.id);
            fetchData();
        } catch (error) {
            console.error("Error deleting grocery:", error);
            setError("Failed to delete grocery item.");
            throw error;
        }
    };

    const addDepositItem = async (item: Omit<Deposit, 'id'>) => {
        try {
            await api.addDeposit(item.userId, item);
            fetchData();
        } catch (error) {
            console.error("Error adding deposit:", error);
            setError("Failed to add deposit.");
            throw error;
        }
    };

    const deleteDepositItem = async (item: Deposit) => {
        try {
            await api.deleteDeposit(item.userId, item.id);
            fetchData();
        } catch (error) {
            console.error("Error deleting deposit:", error);
            setError("Failed to delete deposit.");
            throw error;
        }
    };
    
    const addMember = async (email: string, pass: string) => {
        try {
            await api.signUp(email, pass);
            // Firebase client SDK signs out the admin here.
            // We fetch data, but the app will likely kick the user to the login page.
            await fetchData();
        } catch(e) {
            console.error("Failed to add member", e);
            throw e;
        }
    };


    return {
        loading,
        error,
        members,
        summary,
        addGroceryItem,
        addMultipleGroceryItems,
        deleteGroceryItem,
        addDepositItem,
        deleteDepositItem,
        addMember,
        refreshData: fetchData,
    };
};