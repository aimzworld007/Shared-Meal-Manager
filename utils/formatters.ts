/**
 * @file formatters.ts
 * @summary Utility functions for formatting data like currency and dates.
 */

/**
 * Formats a number as an AED currency string.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string (e.g., "AED 1,234.56").
 */
export const formatCurrency = (amount: number, currency: string = 'AED'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (e) {
    // Fallback for invalid currency codes
    console.warn(`Invalid currency code "${currency}". Falling back to default display.`);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Formats a number as an AED currency string with no fractional digits.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string (e.g., "AED 1,235").
 */
export const formatCurrencyShort = (amount: number, currency: string = 'AED'): string => {
    try {
        return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        }).format(amount);
    } catch (e) {
        // Fallback for invalid currency codes
        console.warn(`Invalid currency code "${currency}". Falling back to default display.`);
        return `${currency} ${Math.round(amount)}`;
    }
};