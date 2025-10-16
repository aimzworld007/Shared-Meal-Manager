import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/firebase';
import { GroceryItem, Deposit, Participant, Member } from '../types';

export const useMealManager = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allGroceries, setAllGroceries] = useState<GroceryItem[]>([]);
    const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
    const [members, setMembers] = useState<Participant[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch members first, as this is a common point of failure for admin permissions
            let membersData: Participant[];
            try {
                membersData = await api.getMembers();
            } catch (err: any) {
                console.error("Failed to fetch members:", err);
                if (err.code === 'permission-denied') {
                    throw new Error("Permission Denied: Could not load members list. Please check your Firestore security rules and ensure the logged-in user has a document in the 'users' collection with a 'role' field set to 'admin'.");
                }
                throw err;
            }

            // Fetch groceries and deposits in parallel now that we know we have basic admin access
            const [groceriesData, depositsData] = await Promise.all([
                api.getAllGroceries().catch(err => {
                    console.error("Failed to fetch groceries:", err);
                    if (err.code === 'permission-denied') throw new Error("Permission Denied: Could not load grocery data. Please check security rules for the 'groceries' collection.");
                    throw err;
                }),
                api.getAllDeposits().catch(err => {
                    console.error("Failed to fetch deposits:", err);
                    if (err.code === 'permission-denied') throw new Error("Permission Denied: Could not load deposit data. Please check security rules for the 'deposits' collection.");
                    throw err;
                })
            ]);
            
            // Create a map for quick email lookups
            const memberMap = new Map(membersData.map(m => [m.id, m.email]));

            // Join member emails with grocery and deposit data
            const groceriesWithEmail = groceriesData.map(g => ({
                ...g,
                purchaserEmail: memberMap.get(g.purchaserId) || 'Unknown Member'
            }));

            const depositsWithEmail = depositsData.map(d => ({
                ...d,
                userEmail: memberMap.get(d.userId) || 'Unknown Member'
            }));
            
            setAllGroceries(groceriesWithEmail);
            setAllDeposits(depositsWithEmail);
            setMembers(membersData);

        } catch (err: any) {
            // The more specific error from inner catches will be caught and displayed
            setError(err.message || "An unknown error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // --- Memoized Calculations ---
    const summary = useMemo(() => {
        const totalGroceryCost = allGroceries.reduce((sum, item) => sum + item.amount, 0);
        const totalDeposits = allDeposits.reduce((sum, item) => sum + item.amount, 0);

        const memberCount = members.length > 0 ? members.length : 1;
        const averageExpense = totalGroceryCost / memberCount;

        const memberData: Member[] = members.map(member => {
            const totalPurchase = allGroceries
                .filter(g => g.purchaserId === member.id)
                .reduce((sum, item) => sum + item.amount, 0);
            
            const totalDeposit = allDeposits
                .filter(d => d.userId === member.id)
                .reduce((sum, item) => sum + item.amount, 0);

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
            allGroceries: allGroceries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            allDeposits: allDeposits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
    }, [allGroceries, allDeposits, members]);

    // --- CRUD Functions ---
    const addGroceryItem = async (item: Omit<GroceryItem, 'id'>) => {
        try {
            await api.addGrocery(item);
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
            const promises = items.map(item => api.addGrocery({ ...item, purchaserId: memberId }));
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
            await api.deleteGrocery(item.id);
            fetchData();
        } catch (error) {
            console.error("Error deleting grocery:", error);
            setError("Failed to delete grocery item.");
            throw error;
        }
    };

    const addDepositItem = async (item: Omit<Deposit, 'id'>) => {
        try {
            await api.addDeposit(item);
            fetchData();
        } catch (error) {
            console.error("Error adding deposit:", error);
            setError("Failed to add deposit.");
            throw error;
        }
    };

    const deleteDepositItem = async (item: Deposit) => {
        try {
            await api.deleteDeposit(item.id);
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