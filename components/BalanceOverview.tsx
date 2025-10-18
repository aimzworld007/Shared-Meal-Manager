/**
 * @file BalanceOverview.tsx
 * @summary A component for the home screen that displays member balances with a list and an interactive comparison chart.
 */
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Member } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../App';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BalanceOverviewProps {
  members: Member[];
  onViewDetails: () => void;
}

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const BalanceOverview: React.FC<BalanceOverviewProps> = ({ members, onViewDetails }) => {
  const { currency } = useAuth();
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const labels = members.map(m => m.name);
    const data = members.map(m => m.balance);

    return {
      labels,
      datasets: [
        {
          label: 'Balance',
          data: data,
          backgroundColor: data.map(balance => balance >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'), // Green for positive, Red for negative
          borderColor: data.map(balance => balance >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [members]);

  const chartOptions: ChartOptions<'bar'> = useMemo(() => {
    const textColor = theme === 'dark' ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(200, 200, 200, 0.2)';

    return {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${formatCurrency(context.parsed.x, currency)}`,
                },
            },
        },
        scales: {
            y: {
                ticks: { color: textColor },
                grid: { display: false },
            },
            x: {
                ticks: {
                    color: textColor,
                    callback: (value) => (typeof value === 'number' ? formatCurrency(value, currency) : value),
                },
                grid: { color: gridColor },
            },
        },
    };
  }, [theme, currency]);


  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Member Balances</h3>
             <button
                onClick={onViewDetails}
                className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
                View Details
                <ArrowRightIcon />
            </button>
        </div>
        <div className="p-4 sm:p-6">
            {members.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
                    {/* List View */}
                    <div>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {members.map(member => (
                                <li key={member.id} className="py-3 flex justify-between items-center">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{member.name}</span>
                                    <span className={`font-semibold text-lg ${member.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {formatCurrency(member.balance, currency)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                     {/* Chart View */}
                    <div className="relative h-64 mt-6 md:mt-0">
                       <Bar options={chartOptions} data={chartData} />
                    </div>
                 </div>
            ) : (
                 <p className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    No members found. Add members in the settings to see their balances.
                </p>
            )}
        </div>
    </div>
  );
};

export default BalanceOverview;