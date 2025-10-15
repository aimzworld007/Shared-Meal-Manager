/**
 * @file CSVImportModal.tsx
 * @summary A modal component for importing data from a CSV file.
 */
import React, { useState } from 'react';
import { Member } from '../types';
// Fix: The types `ParsedDeposit` and `ParsedGrocery` are not exported from `csvParser`.
// They are also not used in this file, so they have been removed from the import to fix the error.
import { parseDepositsCSV, parseGroceriesCSV } from '../utils/csvParser';
import Modal from './Modal';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onImportDeposits: (items: { memberId: string, amount: number, date: string }[]) => Promise<void>;
  onImportGroceries: (items: { name: string, amount: number, date: string, memberIds: string[] }[]) => Promise<void>;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  members,
  onImportDeposits,
  onImportGroceries,
}) => {
  const [importType, setImportType] = useState<'deposits' | 'groceries'>('deposits');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }
    
    setIsImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        if (importType === 'deposits') {
          const parsedData = parseDepositsCSV(text);
          const memberMap = new Map(members.map(m => [m.name.toLowerCase(), m.id]));
          const depositsToImport = parsedData.map(d => {
            const memberId = memberMap.get(d.memberName.toLowerCase());
            if (!memberId) throw new Error(`Member "${d.memberName}" not found.`);
            return { memberId, amount: d.amount, date: d.date };
          });
          await onImportDeposits(depositsToImport);
        } else {
          const parsedData = parseGroceriesCSV(text);
          // Assuming groceries are shared by all members by default on import
          const allMemberIds = members.map(m => m.id);
          const groceriesToImport = parsedData.map(g => ({ ...g, memberIds: allMemberIds }));
          await onImportGroceries(groceriesToImport);
        }
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to parse or import the file.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import from CSV">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Import Type</label>
          <select
            value={importType}
            onChange={(e) => setImportType(e.target.value as 'deposits' | 'groceries')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="deposits">Deposits</option>
            <option value="groceries">Groceries</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">
            {importType === 'deposits' 
                ? 'CSV format: memberName,amount,date (e.g., John Doe,50,2023-10-27)'
                : 'CSV format: name,amount,date (e.g., Milk,5.99,2023-10-27)'
            }
          </p>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">CSV File</label>
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        
        <div className="mt-4 flex justify-end">
            <button 
                onClick={handleImport} 
                disabled={isImporting || !file}
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
            >
                {isImporting ? 'Importing...' : 'Import'}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default CSVImportModal;
