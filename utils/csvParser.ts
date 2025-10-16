/**
 * @file csvParser.ts
 * @summary Utility functions for parsing CSV files.
 */
import { GroceryItem } from '../types';

export interface ParsedGroceryItem {
    date: string;
    name: string;
    amount: number;
    purchaserName: string;
}


/**
 * Parses a CSV file and returns an array of grocery items.
 * A simple implementation without external libraries.
 * @param {File} file - The CSV file to parse.
 * @returns {Promise<ParsedGroceryItem[]>} A promise that resolves with the parsed data.
 */
export const parseCsv = (file: File): Promise<ParsedGroceryItem[]> => {
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
        
        const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
        const dateIndex = headers.indexOf('date');
        const nameIndex = headers.indexOf('name') > -1 ? headers.indexOf('name') : headers.indexOf('item');
        const amountIndex = headers.indexOf('amount') > -1 ? headers.indexOf('amount') : headers.indexOf('price');
        const purchaserIndex = headers.indexOf('purchased by');

        if (dateIndex === -1 || nameIndex === -1 || amountIndex === -1 || purchaserIndex === -1) {
          throw new Error("CSV must contain 'date', 'name' (or 'item'), 'amount' (or 'price'), and 'purchased by' headers.");
        }

        const data = lines
          .filter(line => line.trim() !== '') // Skip empty lines
          .map((line, index) => {
            const values = line.split(',');
            const amount = parseFloat(values[amountIndex]?.trim());

            if (isNaN(amount)) {
                throw new Error(`Invalid amount found on row ${index + 2}.`);
            }
             if (!values[dateIndex]?.trim() || !values[nameIndex]?.trim() || !values[purchaserIndex]?.trim()) {
                 throw new Error(`Missing data on row ${index + 2}.`);
            }

            return {
              date: values[dateIndex].trim(),
              name: values[nameIndex].trim(),
              amount: amount,
              purchaserName: values[purchaserIndex].trim(),
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