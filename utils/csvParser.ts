/**
 * @file csvParser.ts
 * @summary Utility functions for parsing CSV files.
 */
import { GroceryItem } from '../types';

/**
 * Parses a CSV file and returns an array of grocery items.
 * A simple implementation without external libraries.
 * @param {File} file - The CSV file to parse.
 * @returns {Promise<Omit<GroceryItem, 'id' | 'purchaserId'>[]>} A promise that resolves with the parsed data.
 */
export const parseCsv = (file: File): Promise<Omit<GroceryItem, 'id' | 'purchaserId'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        if (!csvText) {
          return resolve([]);
        }
        
        const lines = csvText.trim().split(/\r\n|\n/); // Handle different line endings
        const headerLine = lines.shift();
        if (!headerLine) {
          throw new Error("CSV file is empty or has no header row.");
        }
        
        // Simple CSV parsing: assumes no commas within quoted fields
        const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
        const dateIndex = headers.indexOf('date');
        const nameIndex = headers.indexOf('name');
        const amountIndex = headers.indexOf('amount');

        if (dateIndex === -1 || nameIndex === -1 || amountIndex === -1) {
          throw new Error("CSV must contain 'date', 'name', and 'amount' headers.");
        }

        const data = lines
          .filter(line => line.trim() !== '') // Skip empty lines
          .map((line, index) => {
            const values = line.split(',');
            const amount = parseFloat(values[amountIndex]?.trim());

            if (isNaN(amount)) {
                throw new Error(`Invalid amount found on row ${index + 2}.`);
            }

            return {
              date: values[dateIndex]?.trim(),
              name: values[nameIndex]?.trim(),
              amount: amount,
            };
          });
        
        resolve(data);

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};