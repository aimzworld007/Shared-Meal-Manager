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

        const mealManager = members.find(m => m.isMealManager);
        const totalDepositsFromOthers = filteredDeposits
            .filter(d => mealManager && d.userId !== mealManager.id)
            .reduce((sum, item) => sum + item.amount, 0);

        const memberData: Member[] = members.map(member => {
            const totalPurchase = filteredGroceries
                .filter(g => g.purchaserId === member.id)
                .reduce((sum, item) => sum + item.amount, 0);
            
            const totalDeposit = filteredDeposits
                .filter(d => d.userId === member.id)
                .reduce((sum, item) => sum + item.amount, 0);

            let balance = (totalPurchase + totalDeposit) - averageExpense;

            // If this member is the meal manager, subtract other members' deposits from their balance.
            // This reflects that the manager is holding the group's money.
            if (mealManager && member.id === mealManager.id) {
                balance -= totalDepositsFromOthers;
            }
            
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
        } catch (err) {
            console.error("Error adding grocery:", err);
            setError("Failed to add grocery item.");
            throw err;
        }
    };
    
    const updateGroceryItem = async (itemId: string, data: Partial<Omit<GroceryItem, 'id'>>) => {
        try {
            await api.updateGrocery(itemId, data);
            fetchData(); // Refresh data
        } catch (err) {
            console.error("Error updating grocery:", err);
            setError("Failed to update grocery item.");
            throw err;
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
        } catch (err) {
            console.error("Error importing grocery items:", err);
            // Fix: Type 'unknown' is not assignable to type 'string'. Handle unknown error type before setting error message.
            let message = "Failed to import grocery items.";
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            throw err;
        }
    };

    const deleteGroceryItem = async (item: GroceryItem) => {
        try {
            await api.deleteGrocery(item.id);
            fetchData();
        } catch (err) {
            console.error("Error deleting grocery:", err);
            setError("Failed to delete grocery item.");
            throw err;
        }
    };

    const addDepositItem = async (item: Omit<Deposit, 'id'>) => {
        try {
            await api.addDeposit(item);
            fetchData();
        } catch (err) {
            console.error("Error adding deposit:", err);
            setError("Failed to add deposit.");
            throw err;
        }
    };

    const updateDepositItem = async (depositId: string, data: Partial<Omit<Deposit, 'id'>>) => {
        try {
            await api.updateDeposit(depositId, data);
            fetchData(); // Refresh data
        } catch (err) {
            console.error("Error updating deposit:", err);
            setError("Failed to update deposit.");
            throw err;
        }
    };

    const deleteDepositItem = async (item: Deposit) => {
        try {
            await api.deleteDeposit(item.id);
            fetchData();
        } catch (err) {
            console.error("Error deleting deposit:", err);
            setError("Failed to delete deposit.");
            throw err;
        }
    };

    const addMember = async (name: string, phone: string) => {
        try {
            await api.addMember(name, phone);
            fetchData();
        } catch (err) {
            console.error("Error adding member:", err);
            setError("Failed to add member.");
            throw err;
        }
    };

    const updateMember = async (memberId: string, name: string, phone: string) => {
        try {
            await api.updateMember(memberId, name, phone);
            fetchData();
        } catch (err) {
            console.error("Error updating member:", err);
            setError("Failed to update member.");
            throw err;
        }
    };

    const deleteMember = async (memberId: string) => {
        try {
            await api.deleteMember(memberId);
            fetchData();
        } catch (err) {
            console.error("Error deleting member:", err);
            setError("Failed to delete member.");
            throw err;
        }
    };

    const setMealManager = async (memberId: string) => {
        try {
            await api.setMealManager(memberId);
            fetchData();
        } catch (err) {
            console.error("Error setting meal manager:", err);
            setError("Failed to set meal manager.");
            throw err;
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
        summary,
        members,
        refreshData: fetchData,
        // Groceries
        addGroceryItem,
        updateGroceryItem,
        importGroceryItems,
        deleteGroceryItem,
        // Deposits
        addDepositItem,
        updateDepositItem,
        deleteDepositItem,
        // Members
        addMember,
        updateMember,
        deleteMember,
        setMealManager,
        // Filters
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        minAmount,
        setMinAmount,
        maxAmount,
        setMaxAmount,
        selectedPurchaser,
        setSelectedPurchaser,
        resetFilters,
    };
};