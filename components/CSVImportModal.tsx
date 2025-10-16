/**
 * @file CSVImportModal.tsx
 * @summary A modal component to handle CSV file uploads for bulk data import.
 */
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseCsv, ParsedGroceryItem } from '../utils/csvParser';
import Modal from './Modal';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: ParsedGroceryItem[]) => Promise<void>;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });
  
  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }
    setIsImporting(true);
    setError(null);
    try {
      const items = await parseCsv(file);
      await onImport(items);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to parse or import CSV.');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleClose = () => {
      setFile(null);
      setError(null);
      setIsImporting(false);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Expenses from CSV">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload a CSV file with the headers: <code>date</code>, <code>item</code>, <code>price</code>, and <code>purchased by</code>.
          The date should be in <code>DD-MM-YYYY</code> format.
        </p>
        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer transition-colors ${
            isDragActive ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50' : 'hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input {...getInputProps()} id="file-upload" name="file-upload" type="file" className="sr-only" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">CSV up to 10MB</p>
          </div>
        </div>
        {file && <p className="text-sm text-gray-700 dark:text-gray-300">Selected file: <span className="font-medium">{file.name}</span></p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="pt-2 flex justify-end space-x-2">
            <button
                onClick={handleImport}
                disabled={!file || isImporting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300"
            >
                {isImporting ? 'Importing...' : 'Import Data'}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default CSVImportModal;