
/**
 * @file useMealManager.tsx
 * @summary A custom hook to manage all state and Firestore interactions for meal-related data.
 * This hook is the central point of logic for the dashboard. It fetches data,
 * handles additions and deletions, and performs all necessary financial calculations.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Participant, GroceryItem, Deposit } from '../types';
import * as api from '../services/firebase';

/**
 * Manages all state and Firestore interactions for meal-related data.
 * @param {string | null} adminUid - The unique ID of the admin user to fetch data for.
 * @returns {object} An object containing:
 * - `loading`: A boolean indicating if initial data is being fetched.
 * - `participants`, `groceries`, `deposits`: Arrays of the respective data types.
 * - `addParticipant`, `deleteParticipant`, etc.: Functions to manipulate the data.
 * - `totalExpense`, `totalDeposit`, `totalBalance`: Aggregated financial figures.
 * - `participantSummaries`: A memoized array with detailed financial summaries for each participant.
 */
export const useMealManager = (adminUid: string | null) => {
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
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
        api.fetchParticipants(adminUid),
        api.fetchGroceries(adminUid),
        api.fetchDeposits(adminUid),
      ]);
      setParticipants(pData);
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

  const addParticipant = async (name: string) => {
    if (!adminUid) return;
    const newParticipant = await api.addParticipant(adminUid, name);
    setParticipants(prev => [...prev, newParticipant]);
  };

  const deleteParticipant = async (id: string) => {
    if (!adminUid) return;
    await api.deleteParticipant(adminUid, id);
    setParticipants(prev => prev.filter(p => p.id !== id));
  };
  
  const addGrocery = async (item: Omit<GroceryItem, 'id'>) => {
    if (!adminUid) return;
    const newGrocery = await api.addGrocery(adminUid, item);
    setGroceries(prev => [...prev, newGrocery]);
  };

  const deleteGrocery = async (id: string) => {
    if (!adminUid) return;
    await api.deleteGrocery(adminUid, id);
    setGroceries(prev => prev.filter(g => g.id !== id));
  };

  const addDeposit = async (item: Omit<Deposit, 'id'>) => {
    if (!adminUid) return;
    const newDeposit = await api.addDeposit(adminUid, item);
    setDeposits(prev => [...prev, newDeposit]);
  };

  const deleteDeposit = async (id: string) => {
    if (!adminUid) return;
    await api.deleteDeposit(adminUid, id);
    setDeposits(prev => prev.filter(d => d.id !== id));
  };


  // --- Memoized Calculations ---

  const totalExpense = useMemo(() => {
    return groceries.reduce((acc, item) => acc + item.amount, 0);
  }, [groceries]);

  const totalDeposit = useMemo(() => {
    return deposits.reduce((acc, item) => acc + item.amount, 0);
  }, [deposits]);

  const totalBalance = useMemo(() => totalDeposit - totalExpense, [totalDeposit, totalExpense]);

  const participantSummaries = useMemo(() => {
    // Avoid division by zero if there are no participants.
    const perPersonShare = participants.length > 0 ? totalExpense / participants.length : 0;
    
    return participants.map(participant => {
      // Calculate total deposits for the current participant.
      const participantDeposits = deposits
        .filter(d => d.participantId === participant.id)
        .reduce((acc, d) => acc + d.amount, 0);
      
      const balance = participantDeposits - perPersonShare;
      
      return {
        ...participant,
        totalDeposit: participantDeposits,
        share: perPersonShare,
        balance,
      };
    });
  }, [participants, deposits, totalExpense]);

  return {
    loading,
    participants,
    groceries,
    deposits,
    addParticipant,
    deleteParticipant,
    addGrocery,
    deleteGrocery,
    addDeposit,
    deleteDeposit,
    totalExpense,
    totalDeposit,
    totalBalance,
    participantSummaries,
  };
};
