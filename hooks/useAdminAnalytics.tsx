/**
 * @file useAdminAnalytics.tsx
 * @summary Custom hook to fetch and process platform-wide data for the admin dashboard.
 */
import { useState, useEffect, useMemo } from 'react';
// Fix: Import the comprehensive UserDataSummary type from the firebase service.
import { UserDataSummary } from '../services/firebase';
import * as api from '../services/firebase';
import { GroceryItem, Deposit } from '../types';

/**
 * Provides all the data and logic needed for the admin analytics dashboard.
 * It fetches data for all users and computes various statistics and chart-ready data structures.
 * @returns {object} An object containing loading state, aggregated stats, and chart data.
 */
export const useAdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    // Fix: State now holds the complete UserDataSummary.
    const [allUsersData, setAllUsersData] = useState<UserDataSummary[]>([]);

    /**
     * Fetches the data for all users from the Firebase service.
     * Side Effect: Calls the `fetchAllUsersData` API.
     */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fix: Call fetchAllUsersData to get complete user and subcollection data, removing the need for mock data.
                const data = await api.fetchAllUsersData();
                setAllUsersData(data);
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Memoized Global Statistics ---

    const globalStats = useMemo(() => {
        const totalUsers = allUsersData.length;
        const totalExpense = allUsersData.reduce((acc, user) =>
            acc + user.groceries.reduce((sum, g) => sum + g.amount, 0), 0);
        const totalDeposit = allUsersData.reduce((acc, user) =>
            acc + user.deposits.reduce((sum, d) => sum + d.amount, 0), 0);
        return { totalUsers, totalExpense, totalDeposit };
    }, [allUsersData]);


    // --- Memoized Chart Data ---

    /**
     * Data for the "Expense vs. Deposit per User" Bar Chart.
     */
    const expenseVsDepositChartData = useMemo(() => {
        // Fix: Changed property from email to userEmail to match the UserDataSummary type.
        const labels = allUsersData.map(u => u.userEmail);
        const expenseData = allUsersData.map(u => u.groceries.reduce((sum, g) => sum + g.amount, 0));
        const depositData = allUsersData.map(u => u.deposits.reduce((sum, d) => sum + d.amount, 0));

        return {
            labels,
            datasets: [
                {
                    label: 'Total Expense',
                    data: expenseData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)', // red-500
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Total Deposit',
                    data: depositData,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)', // green-500
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1,
                },
            ],
        };
    }, [allUsersData]);

    /**
     * Data for the "Spending Over Time" Line Chart.
     */
    const spendingOverTimeChartData = useMemo(() => {
        // Get all grocery items from all users and sort them by date
        const allGroceries = allUsersData.flatMap(u => u.groceries)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (allGroceries.length === 0) {
            return { labels: [], datasets: [] };
        }

        const dailySpending: { [date: string]: number } = {};
        allGroceries.forEach(g => {
            const date = g.date.split('T')[0]; // Normalize date to YYYY-MM-DD
            dailySpending[date] = (dailySpending[date] || 0) + g.amount;
        });

        const sortedDates = Object.keys(dailySpending).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
        const labels = sortedDates;
        let cumulativeAmount = 0;
        const data = sortedDates.map(date => {
            cumulativeAmount += dailySpending[date];
            return cumulativeAmount;
        });

        return {
            labels,
            datasets: [{
                label: 'Cumulative Expense',
                data,
                fill: true,
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)', // indigo-600
                tension: 0.1,
            }],
        };
    }, [allUsersData]);

    return {
        loading,
        globalStats,
        expenseVsDepositChartData,
        spendingOverTimeChartData,
    };
};
