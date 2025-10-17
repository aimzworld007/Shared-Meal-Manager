/**
 * @file SummaryCard.tsx
 * @summary A reusable component to display a single key statistic.
 */
import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardProps {
  title: string;
  value: number | string;
  isCurrency?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isCurrency = false }) => {
  const displayValue = isCurrency && typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5 text-center">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">{displayValue}</p>
    </div>
  );
};
