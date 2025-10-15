
/**
 * @file SummaryCard.tsx
 * @summary A reusable UI component for displaying a single piece of summary data.
 */
import React from 'react';

/**
 * Defines the props for the SummaryCard component.
 */
export interface SummaryCardProps {
  /** The title to display on the card (e.g., "Total Expense"). */
  title: string;
  /** The numerical value to display. */
  value: number;
  /** A boolean to indicate if the value should be formatted as currency. */
  isCurrency?: boolean;
  /** A boolean to conditionally style the value (e.g., green for positive, red for negative). */
  isPositive?: boolean;
}

/**
 * Formats a number as a currency string.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string (e.g., "$125.50").
 */
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

/**
 * Renders a summary card for displaying key financial figures.
 * @param {SummaryCardProps} props - The component props.
 * @param {string} props.title - The title to display on the card.
 * @param {number} props.value - The value to display.
 * @param {boolean} [props.isCurrency=false] - Whether to format the value as currency.
 * @param {boolean} [props.isPositive] - Used to apply conditional styling for balance.
 * @returns {JSX.Element} The rendered SummaryCard component.
 */
export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isCurrency = false, isPositive }) => {
  const displayValue = isCurrency ? formatCurrency(value) : value.toString();

  // Determine color based on the isPositive prop, default to standard text color if not applicable.
  const valueColor = isPositive === undefined
    ? 'text-gray-900'
    : isPositive
    ? 'text-green-600'
    : 'text-red-600';

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
            <p className={`text-3xl font-semibold ${valueColor}`}>{displayValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
