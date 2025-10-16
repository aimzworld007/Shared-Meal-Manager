import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/firebase';
import { GroceryItem, Deposit, Participant, Member } from '../types';
import { ParsedGroceryItem } from '../utils/csvParser';

export const useMealManager = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allGroceries, setAllGroceries] = useState<GroceryItem[]>([]);
    const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
    const [members, setMembers] = useState<Participant[]>([]);
    
    // State for filtering
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [minAmount, setMinAmount] = useState<string>('');
    const [maxAmount, setMaxAmount] = useState<string>('');
    const [selectedPurchaser, setSelectedPurchaser] = useState<string>('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all data in parallel for the logged-in user
            const [membersData, groceriesData, depositsData] = await Promise.all([
                api.getMembers(),
                api.getAllGroceries(),
                api.getAllDeposits()
            ]);
            
            // Create a map for quick name lookups
            const memberMap = new Map(membersData.map(m => [m.id, m.name]));

            // Join member names with grocery and deposit data
            const groceriesWithName = groceriesData.map(g => ({
                ...g,
                purchaserName: memberMap.get(g.purchaserId) || 'Unknown Member'
            }));

            const depositsWithName = depositsData.map(d => ({
                ...d,
                userName: memberMap.get(d.userId) || 'Unknown Member'
            }));
            
            setAllGroceries(groceriesWithName);
            setAllDeposits(depositsWithName);
            setMembers(membersData);

        } catch (err: any) {
            console.error("Data Fetch Error:", err);
            if (err.code === 'permission-denied') {
                 setError("Permission Denied: Could not load your data. Please check your Firestore security rules to ensure you are allowed to access your own data.");
            } else {
                setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
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
        // Filter groceries and deposits based on the selected date range
        const filteredGroceries = allGroceries.filter(item => {
            const itemDate = item.date.split('T')[0];
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            
            if (selectedPurchaser && item.purchaserId !== selectedPurchaser) return false;

            const min = parseFloat(minAmount);
            if (!isNaN(min) && item.amount < min) return false;

            const max = parseFloat(maxAmount);
            if (!isNaN(max) && item.amount > max) return false;

            return true;
        });

        const filteredDeposits = allDeposits.filter(item => {
            if (!startDate && !endDate) return true; // No filter if no dates are set
            const itemDate = item.date.split('T')[0];
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            return true;
        });

        const totalGroceryCost = filteredGroceries.reduce((sum, item) => sum + item.amount, 0);
        const totalDeposits = filteredDeposits.reduce((sum, item) => sum + item.amount, 0);

        const memberCount = members.length > 0 ? members.length : 1;
        const averageExpense = totalGroceryCost / memberCount;

        const memberData: Member[] = members.map(member => {
            const totalPurchase = filteredGroceries
                .filter(g => g.purchaserId === member.id)
                .reduce((sum, item) => sum + item.amount, 0);
            
            const totalDeposit = filteredDeposits
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
            allGroceries: filteredGroceries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            allDeposits: filteredDeposits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
    }, [allGroceries, allDeposits, members, startDate, endDate, minAmount, maxAmount, selectedPurchaser]);

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
    
    const importGroceryItems = async (items: ParsedGroceryItem[]) => {
        setError(null);
        try {
            const memberNameMap = new Map(members.map(m => [m.name.toLowerCase().trim(), m.id]));
            const itemsToAdd: Omit<GroceryItem, 'id'>[] = [];
            const unknownMembers: string[] = [];

            for (const item of items) {
                const purchaserId = memberNameMap.get(item.purchaserName.toLowerCase().trim());
                if (purchaserId) {
                    itemsToAdd.push({
                        name: item.name,
                        amount: item.amount,
                        date: item.date,
                        purchaserId: purchaserId,
                    });
                } else {
                    unknownMembers.push(item.purchaserName);
                }
            }
            
            if (unknownMembers.length > 0) {
                const uniqueUnknown = [...new Set(unknownMembers)];
                throw new Error(`The following purchasers were not found: ${uniqueUnknown.join(', ')}. Please add them as members first or check for typos in your CSV.`);
            }

            const promises = itemsToAdd.map(item => api.addGrocery(item));
            await Promise.all(promises);
            fetchData();
        } catch (error) {
            console.error("Error importing grocery items:", error);
            // The caught 'error' is of type 'unknown'. Check if it is an instance of Error
            // to safely access its `message` property before setting the error state.
            const message = error instanceof Error ? error.message : "Failed to import grocery items.";
            setError(message);
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
    
    const addMember = async (name: string) => {
        try {
            await api.addMember(name);
            await fetchData();
        } catch(e) {
            console.error("Failed to add member", e);
            setError("Failed to add new member.");
            throw e;
        }
    };
    
    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setMinAmount('');
        setMaxAmount('');
        setSelectedPurchaser('');
    };


    return {
        loading,
        error,
        members,
        summary,
        // filters
        startDate,
        endDate,
        minAmount,
        maxAmount,
        selectedPurchaser,
        setStartDate,
        setEndDate,
        setMinAmount,
        setMaxAmount,
        setSelectedPurchaser,
        resetFilters,
        // actions
        addGroceryItem,
        importGroceryItems,
        deleteGroceryItem,
        addDepositItem,
        deleteDepositItem,
        addMember,
        refreshData: fetchData,
    };
};