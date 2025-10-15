/**
 * @file useAdminDataManager.tsx
 * @summary Custom hook for managing (viewing, editing, deleting) all user data from an admin perspective.
 */
import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/firebase';
import { UserDataSummary } from '../services/firebase';

export const useAdminDataManager = () => {
    const [allUsersData, setAllUsersData] = useState<UserDataSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.fetchAllUsersData();
            setAllUsersData(data);
        } catch (err) {
            console.error("Failed to fetch all users data:", err);
            setError("Could not load platform data. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // In a real application, you would add functions here to edit/delete user data from an admin panel, e.g.:
    // const deleteUserGrocery = async (userId: string, groceryId: string) => { 
    //   await api.deleteGrocery(userId, groceryId);
    //   fetchData();
    // }
    
    return {
        allUsersData,
        loading,
        error,
        refreshData: fetchData,
    };
};
