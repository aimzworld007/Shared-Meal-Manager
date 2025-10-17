import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/firebase';
import { GroceryItem, Deposit, Participant, Member, Period, ArchiveData } from '../types';
import { ParsedGroceryItem } from '../utils/csvParser';

export const useMealManager = () => {
    const [loading, setLoading] = useState(true);
    const [isPeriodLoading, setIsPeriodLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activePeriod, setActivePeriod] = useState<Period | null>(null);
    const [groceries, setGroceries] = useState<GroceryItem[]>([]);
    const [allDeposits, setAllDeposits] = useState<Deposit[]>([]);
    const [members, setMembers] = useState<Participant[]>([]);
    
    // State for filtering
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [minAmount, setMinAmount] = useState<string>('');
    const [maxAmount, setMaxAmount] = useState<string>('');
    const [selectedPurchaser, setSelectedPurchaser] = useState<string>('');
    
    const fetchAndSetActivePeriod = useCallback(async () => {
        setIsPeriodLoading(true);
        try {
            const period = await api.getActivePeriod();
            setActivePeriod(period);
        } catch (err: any) {
             setError(err instanceof Error ? err.message : "An unknown error occurred while fetching period data.");
        } finally {
            setIsPeriodLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchAndSetActivePeriod();
    }, [fetchAndSetActivePeriod]);

    const fetchDataForPeriod = useCallback(async () => {
        if (!activePeriod) {
            setGroceries([]);
            setAllDeposits([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [membersData, groceriesData, depositsData] = await Promise.all([
                api.getMembers(),
                api.getAllGroceries(activePeriod.id),
                api.getAllDeposits(activePeriod.id)
            ]);
            
            const memberMap = new Map(membersData.map(m => [m.id, m.name]));

            const groceriesWithName = groceriesData.map(g => ({ ...g, purchaserName: memberMap.get(g.purchaserId) || 'Unknown Member' }));
            const depositsWithName = depositsData.map(d => ({ ...d, userName: memberMap.get(d.userId) || 'Unknown Member' }));
            
            setGroceries(groceriesWithName);
            // Fix: Corrected typo from 'deposWithName' to 'depositsWithName'.
            setAllDeposits(depositsWithName);
            setMembers(membersData);

        } catch (err: any) {
            console.error("Data Fetch Error:", err);
            if (err.code === 'permission-denied') {
                 setError("Permission Denied: Could not load your data. Please check your Firestore security rules.");
            } else {
                setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
            }
        } finally {
            setLoading(false);
        }
    }, [activePeriod]);

    useEffect(() => {
        fetchDataForPeriod();
    }, [fetchDataForPeriod]);
    
    // --- Memoized Calculations ---
    const summary = useMemo(() => {
        // Filter groceries and deposits based on the selected date range
        const filteredGroceries = groceries.filter(item => {
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
            if (!startDate && !endDate) return true;
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
            .filter(d => mealManager && d.userId !== mealManager.id && !d.notes?.includes('Balance transfer')) // Exclude transfers from this calc
            .reduce((sum, item) => sum + item.amount, 0);

        const memberData: Member[] = members.map(member => {
            const totalPurchase = filteredGroceries
                .filter(g => g.purchaserId === member.id)
                .reduce((sum, item) => sum + item.amount, 0);
            
            const totalDeposit = filteredDeposits
                .filter(d => d.userId === member.id)
                .reduce((sum, item) => sum + item.amount, 0);

            let balance = (totalPurchase + totalDeposit) - averageExpense;

            if (mealManager && member.id === mealManager.id) {
                balance -= totalDepositsFromOthers;
            }
            
            return { ...member, totalPurchase, totalDeposit, balance };
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
    }, [groceries, allDeposits, members, startDate, endDate, minAmount, maxAmount, selectedPurchaser]);

    // --- CRUD Functions ---
    const addGroceryItem = async (item: Omit<GroceryItem, 'id'>) => {
        if (!activePeriod) { setError("No active period."); return; }
        try {
            await api.addGrocery(activePeriod.id, item);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to add grocery item."); throw err; }
    };
    
    const updateGroceryItem = async (itemId: string, data: Partial<Omit<GroceryItem, 'id'>>) => {
        if (!activePeriod) { setError("No active period."); return; }
        try {
            await api.updateGrocery(activePeriod.id, itemId, data);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to update grocery item."); throw err; }
    };

    const importGroceryItems = async (items: ParsedGroceryItem[]) => {
        if (!activePeriod) { setError("No active period to import into."); return; }
        setError(null);
        try {
            const memberNameMap = new Map(members.map(m => [m.name.toLowerCase().trim(), m.id]));
            const itemsToAdd: Omit<GroceryItem, 'id'>[] = [];
            const unknownMembers: string[] = [];

            for (const item of items) {
                const purchaserId = memberNameMap.get(item.purchaserName.toLowerCase().trim());
                if (purchaserId) {
                    itemsToAdd.push({ name: item.name, amount: item.amount, date: item.date, purchaserId: purchaserId });
                } else {
                    unknownMembers.push(item.purchaserName);
                }
            }
            
            if (unknownMembers.length > 0) {
                throw new Error(`Purchasers not found: ${[...new Set(unknownMembers)].join(', ')}. Please add them as members first.`);
            }

            const promises = itemsToAdd.map(item => api.addGrocery(activePeriod.id, item));
            await Promise.all(promises);
            fetchDataForPeriod();
        // Fix: Correctly handle the 'unknown' type in the catch block to prevent type errors.
        } catch (err) {
            let message = "Failed to import grocery items.";
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            throw err;
        }
    };

    const deleteGroceryItem = async (item: GroceryItem) => {
        if (!activePeriod) { setError("No active period."); return; }
        try {
            await api.deleteGrocery(activePeriod.id, item.id);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to delete grocery item."); throw err; }
    };

    const addDepositItem = async (item: Omit<Deposit, 'id'>) => {
        if (!activePeriod) { setError("No active period."); return; }
        try {
            await api.addDeposit(activePeriod.id, item);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to add deposit."); throw err; }
    };

    const updateDepositItem = async (depositId: string, data: Partial<Omit<Deposit, 'id'>>) => {
        if (!activePeriod) { setError("No active period."); return; }
        try {
            await api.updateDeposit(activePeriod.id, depositId, data);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to update deposit."); throw err; }
    };

    const deleteDepositItem = async (item: Deposit) => {
        if (!activePeriod) { setError("No active period."); return; }
        try {
            await api.deleteDeposit(activePeriod.id, item.id);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to delete deposit."); throw err; }
    };

    const addMember = async (name: string, phone: string) => {
        try {
            await api.addMember(name, phone);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to add member."); throw err; }
    };

    const updateMember = async (memberId: string, name: string, phone: string) => {
        try {
            await api.updateMember(memberId, name, phone);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to update member."); throw err; }
    };

    const deleteMember = async (memberId: string) => {
        try {
            await api.deleteMember(memberId);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to delete member."); throw err; }
    };

    const setMealManager = async (memberId: string) => {
        try {
            await api.setMealManager(memberId);
            fetchDataForPeriod();
        } catch (err) { setError("Failed to set meal manager."); throw err; }
    };
    
    // --- Period Management ---
    const updateActivePeriod = async (periodData: Omit<Period, 'id' | 'status'>) => {
        if (!activePeriod) throw new Error("No active period to update.");
        try {
            await api.updatePeriod(activePeriod.id, periodData);
            await fetchAndSetActivePeriod();
        } catch (err) {
            setError("Failed to update the active period.");
            throw err;
        }
    };
    
    const archiveAndStartNewPeriod = async (
        newPeriodData: Omit<Period, 'id'|'status'>,
        transferBalances: boolean
    ) => {
        if (!activePeriod) throw new Error("No active period to archive.");

        const archiveData: ArchiveData = {
            members: summary.members,
            groceries: groceries,
            deposits: allDeposits,
            summary: {
                totalMembers: summary.totalMembers,
                totalGroceryCost: summary.totalGroceryCost,
                totalDeposits: summary.totalDeposits,
                averageExpense: summary.averageExpense,
                periodName: activePeriod.name,
                periodStartDate: activePeriod.startDate,
                periodEndDate: activePeriod.endDate,
            }
        };

        try {
            await api.archivePeriodAndStartNew(activePeriod, archiveData, newPeriodData, transferBalances);
            await fetchAndSetActivePeriod(); // This will trigger a full data refresh
        } catch (err) {
            setError("Failed to archive and start new period.");
            throw err;
        }
    };

    const createFirstPeriod = async (periodData: Omit<Period, 'id' | 'status'>) => {
        try {
            await api.createFirstPeriod(periodData);
            await fetchAndSetActivePeriod();
        } catch (err) {
            setError("Failed to create the first period.");
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
        groceries,
        activePeriod,
        isPeriodLoading,
        refreshData: fetchDataForPeriod,
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
        // Periods
        archiveAndStartNewPeriod,
        createFirstPeriod,
        updateActivePeriod,
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