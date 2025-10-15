/**
 * @file SummaryCard.tsx
 * @summary A reusable component to display a single key statistic.
 */
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
}

/**
 * Formats a number as a currency string.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string (e.g., "AED 1,234.56").
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
  }).format(amount);
};

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isCurrency = false }) => {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <div className="bg-white shadow rounded-lg p-5 text-center">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{displayValue}</p>
    </div>
  );
};
