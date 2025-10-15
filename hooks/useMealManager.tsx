/**
 * @file useMealManager.tsx
 * @summary A comprehensive custom hook to manage all aspects of a user's meal plan.
 * It encapsulates state management, data fetching, and business logic for members,
 * groceries, and deposits, and provides computed summaries.
 */
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import * as api from '../services/firebase';
import { Member, GroceryItem, Deposit } from '../types';

/**
 * Provides all the data, state, and functions needed to manage a shared meal plan.
 * @returns {object} An object containing the meal plan data, loading states, computed
 * summaries, and functions to interact with the data.
 */
export const useMealManager = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Subscribes to real-time updates for all data collections (members, groceries, deposits)
   * for the currently authenticated user.
   * Side Effect: Sets up Firestore listeners.
   */
  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      setError(null);

      const unsubscribers = [
        api.getMembers(user.uid, setMembers),
        api.getGroceries(user.uid, setGroceries),
        api.getDeposits(user.uid, setDeposits),
      ];
      
      setLoading(false);

      // Cleanup listeners on unmount or user change
      return () => unsubscribers.forEach(unsub => unsub());
    }
  }, [user?.uid]);

  // --- API Functions ---

  const handleApiCall = async <T extends any[]>(apiCall: (...args: T) => Promise<any>, ...args: T) => {
    if (!user?.uid) {
        setError("You must be logged in to perform this action.");
        return;
    }
    setError(null);
    try {
        await apiCall(...args);
    } catch (e: any) {
        console.error("API call failed:", e);
        setError(e.message);
    }
  };

  const addMember = async (name: string) => {
    if(user?.uid) await handleApiCall(api.addMember, user.uid, name);
  };
  const deleteMember = async (memberId: string) => {
    if(user?.uid) await handleApiCall(api.deleteMember, user.uid, memberId);
  };

  const addGrocery = async (item: Omit<GroceryItem, 'id'>) => {
    if(user?.uid) await handleApiCall(api.addGrocery, user.uid, item);
  };
  const deleteGrocery = async (itemId: string) => {
    if(user?.uid) await handleApiCall(api.deleteGrocery, user.uid, itemId);
  };

  const addDeposit = async (deposit: Omit<Deposit, 'id'>) => {
    if(user?.uid) await handleApiCall(api.addDeposit, user.uid, deposit);
  };
  const deleteDeposit = async (depositId: string) => {
    if(user?.uid) await handleApiCall(api.deleteDeposit, user.uid, depositId);
  };


  // --- Memoized Calculations ---

  const totalSpent = useMemo(() => {
    return groceries.reduce((total, item) => total + item.amount, 0);
  }, [groceries]);

  const totalDeposits = useMemo(() => {
    return deposits.reduce((total, item) => total + item.amount, 0);
  }, [deposits]);

  const balanceSummaries = useMemo(() => {
    const sharePerMember = members.length > 0 ? totalSpent / members.length : 0;
    
    return members.map(member => {
        const totalDeposit = deposits
            .filter(d => d.memberId === member.id)
            .reduce((sum, d) => sum + d.amount, 0);
        const balance = totalDeposit - sharePerMember;
        return {
            ...member,
            totalDeposit,
            share: sharePerMember,
            balance,
        };
    });
  }, [members, deposits, totalSpent]);

  return {
    loading,
    error,
    members,
    groceries,
    deposits,
    addMember,
    deleteMember,
    addGrocery,
    deleteGrocery,
    addDeposit,
    deleteDeposit,
    totalSpent,
    totalDeposits,
    balanceSummaries,
  };
};
