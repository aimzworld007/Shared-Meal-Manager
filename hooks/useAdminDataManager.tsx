/**
 * @file useAdminDataManager.tsx
 * @summary Custom hook for fetching and managing all user data from an admin perspective.
 */
import { useState, useEffect } from 'react';
// Fix: Corrected import to use UserSummary as UserDataSummary to match the exported member from firebase service.
import { UserSummary as UserDataSummary } from '../services/firebase';
import * as api from '../services/firebase';

/**
 * Provides data fetching logic for the admin data management view.
 * @returns {object} An object containing loading state and the data for all users.
 */
export const useAdminDataManager = () => {
    const [loading, setLoading] = useState(true);
    const [allUsersData, setAllUsersData] = useState<UserDataSummary[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    /**
     * Fetches the data for all users from the Firebase service.
     * Side Effect: Calls the `fetchAllUsersData` API.
     */
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fix: Corrected function call to fetchAllUsers to match the exported function from firebase service.
            const data = await api.fetchAllUsers();
            setAllUsersData(data);
        } catch (error: any) {
            console.error("Failed to fetch admin data:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // In a full implementation, you might add functions here to
    // delete a user's data, edit entries, etc., which would then
    // call api service functions and refetch the data.
    
    return {
        loading,
        error,
        allUsersData,
        refreshData: fetchData, // Expose a function to manually refetch
    };
};