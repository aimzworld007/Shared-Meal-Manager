/**
 * @file useMealManager.tsx
 * @summary A custom hook to manage all state and Firestore interactions for meal-related data.
 * This hook is the central point of logic for the dashboard. It fetches data,
 * handles additions and deletions, and performs all necessary financial calculations.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Member, GroceryItem, Deposit } from '../types';
import * as api from '../services/firebase';

/**
 * Manages all state and Firestore interactions for meal-related data.
 * @param {string | null} adminUid - The unique ID of the admin user to fetch data for.
 * @returns {object} An object containing:
 * - `loading`: A boolean indicating if initial data is being fetched.
 * - `members`, `groceries`, `deposits`: Arrays of the respective data types.
 * - `addMember`, `deleteMember`, etc.: Functions to manipulate the data.
 * - `totalExpense`, `totalDeposit`, `totalBalance`: Aggregated financial figures.
 * - `memberSummaries`: A memoized array with detailed financial summaries for each member.
 */
export const useMealManager = (adminUid: string | null) => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  /**
   * Fetches all initial data from the mock Firestore service.
   * Runs only once when the component mounts and adminUid is available.
   * Side Effect: Makes multiple API calls to fetch data.
   */
  const fetchData = useCallback(async () => {
    if (!adminUid) return;
    setLoading(true);
    try {
      const [pData, gData, dData] = await Promise.all([
        api.fetchMembers(adminUid),
        api.fetchGroceries(adminUid),
        api.fetchDeposits(adminUid),
      ]);
      setMembers(pData);
      setGroceries(gData);
      setDeposits(dData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [adminUid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Data Manipulation Functions ---

  const addMember = async (name: string) => {
    if (!adminUid) return;
    try {
      const newMember = await api.addMember(adminUid, name);
      setMembers(prev => [...prev, newMember]);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const deleteMember = async (id: string) => {
    if (!adminUid) return;
    try {
      await api.deleteMember(adminUid, id);
      setMembers(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };
  
  const addGrocery = async (item: Omit<GroceryItem, 'id'>) => {
    if (!adminUid) return;
    try {
      const newGrocery = await api.addGrocery(adminUid, item);
      setGroceries(prev => [...prev, newGrocery]);
    } catch (error) {
      console.error("Failed to add grocery:", error);
    }
  };

  const deleteGrocery = async (id: string) => {
    if (!adminUid) return;
    try {
      await api.deleteGrocery(adminUid, id);
      setGroceries(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error("Failed to delete grocery:", error);
    }
  };

  const addDeposit = async (item: Omit<Deposit, 'id'>) => {
    if (!adminUid) return;
    try {
      const newDeposit = await api.addDeposit(adminUid, item);
      setDeposits(prev => [...prev, newDeposit]);
    } catch (error) {
      console.error("Failed to add deposit:", error);
    }
  };

  const deleteDeposit = async (id: string) => {
    if (!adminUid) return;
    try {
      await api.deleteDeposit(adminUid, id);
      setDeposits(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error("Failed to delete deposit:", error);
    }
  };


  // --- Memoized Calculations ---

  const totalExpense = useMemo(() => {
    return groceries.reduce((acc, item) => acc + item.amount, 0);
  }, [groceries]);

  const totalDeposit = useMemo(() => {
    return deposits.reduce((acc, item) => acc + item.amount, 0);
  }, [deposits]);

  const totalBalance = useMemo(() => totalDeposit - totalExpense, [totalDeposit, totalExpense]);

  const memberSummaries = useMemo(() => {
    // Avoid division by zero if there are no members.
    const perPersonShare = members.length > 0 ? totalExpense / members.length : 0;
    
    return members.map(member => {
      // Calculate total deposits for the current member.
      const memberDeposits = deposits
        .filter(d => d.memberId === member.id)
        .reduce((acc, d) => acc + d.amount, 0);
      
      const balance = memberDeposits - perPersonShare;
      
      return {
        ...member,
        totalDeposit: memberDeposits,
        share: perPersonShare,
        balance,
      };
    });
  }, [members, deposits, totalExpense]);

  return {
    loading,
    members,
    groceries,
    deposits,
    addMember,
    deleteMember,
    addGrocery,
    deleteGrocery,
    addDeposit,
    deleteDeposit,
    totalExpense,
    totalDeposit,
    totalBalance,
    memberSummaries,
  };
};