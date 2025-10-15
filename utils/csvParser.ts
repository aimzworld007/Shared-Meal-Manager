/**
 * @file csvParser.ts
 * @summary A utility for parsing CSV files into structured data.
 */
import { ParsedDeposit, ParsedGrocery } from '../types';

/**
 * Parses a CSV string for deposit data.
 * Expected format: memberName,amount,date (e.g., "John Doe,50,2023-10-27")
 * @param {string} csvString - The raw CSV content.
 * @returns {ParsedDeposit[]} An array of parsed deposit objects.
 */
export const parseDepositsCSV = (csvString: string): ParsedDeposit[] => {
    const lines = csvString.trim().split('\n');
    const results: ParsedDeposit[] = [];

    // Skip header if it exists
    const startIndex = lines[0] && lines[0].toLowerCase().includes('member') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        if (!lines[i]) continue; // Skip empty lines
        const [memberName, amountStr, date] = lines[i].split(',').map(s => s.trim());
        const amount = parseFloat(amountStr);
        if (memberName && !isNaN(amount) && date) {
            results.push({ memberName, amount, date });
        }
    }
    return results;
};

/**
 * Parses a CSV string for grocery data.
 * Expected format: name,amount,date (e.g., "Milk,5.99,2023-10-27")
 * @param {string} csvString - The raw CSV content.
 * @returns {ParsedGrocery[]} An array of parsed grocery objects.
 */
export const parseGroceriesCSV = (csvString: string): ParsedGrocery[] => {
    const lines = csvString.trim().split('\n');
    const results: ParsedGrocery[] = [];

    const startIndex = lines[0] && lines[0].toLowerCase().includes('name') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        if (!lines[i]) continue; // Skip empty lines
        const [name, amountStr, date] = lines[i].split(',').map(s => s.trim());
        const amount = parseFloat(amountStr);
        if (name && !isNaN(amount) && date) {
            results.push({ name, amount, date });
        }
    }
    return results;
};
