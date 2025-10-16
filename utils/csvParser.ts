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
        const nameIndex = headers.indexOf('item') > -1 ? headers.indexOf('item') : headers.indexOf('name');
        const amountIndex = headers.indexOf('price') > -1 ? headers.indexOf('price') : headers.indexOf('amount');
        const purchaserIndex = headers.indexOf('purchased by');

        if (dateIndex === -1 || nameIndex === -1 || amountIndex === -1 || purchaserIndex === -1) {
          throw new Error("CSV must contain 'date', 'item' (or 'name'), 'price' (or 'amount'), and 'purchased by' headers.");
        }

        const data = lines
          .filter(line => line.trim() !== '') // Skip empty lines
          .map((line, index) => {
            const values = line.split(',');
            const amount = parseFloat(values[amountIndex]?.trim());

            if (isNaN(amount)) {
                throw new Error(`Invalid amount found on row ${index + 2}.`);
            }
            
            // Date parsing for DD-MM-YYYY
            const dateStr = values[dateIndex]?.trim();
            if (!dateStr) {
                throw new Error(`Missing date on row ${index + 2}.`);
            }
            const parts = dateStr.split(/[-/]/);
            if (parts.length !== 3) {
                throw new Error(`Invalid date format on row ${index + 2}. Expected DD-MM-YYYY.`);
            }
            const [day, month, year] = parts;
            const fullYear = year.length === 2 ? `20${year}` : year;
            const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            
            // Validate date
            const d = new Date(isoDate);
            if (d.toString() === 'Invalid Date' || d.toISOString().slice(0, 10) !== isoDate) {
                 throw new Error(`Invalid date value on row ${index + 2}: '${dateStr}'.`);
            }

             if (!values[nameIndex]?.trim() || !values[purchaserIndex]?.trim()) {
                 throw new Error(`Missing data on row ${index + 2}.`);
            }

            return {
              date: isoDate,
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