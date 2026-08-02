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
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Upload a CSV file with the headers: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">date</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">item</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">price</code>, and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">purchased by</code>.
          The date should be in <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">DD-MM-YYYY</code> format.
        </p>
        <div
          {...getRootProps()}
          className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-[1.5rem] cursor-pointer transition-all ${
            isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          <div className="space-y-2 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-slate-600 dark:text-slate-400 items-center justify-center">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input {...getInputProps()} id="file-upload" name="file-upload" type="file" className="sr-only" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">CSV up to 10MB</p>
          </div>
        </div>
        {file && <p className="text-sm text-slate-700 dark:text-slate-300">Selected file: <span className="font-bold">{file.name}</span></p>}
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
        <div className="pt-4 flex justify-end">
            <button
                onClick={handleImport}
                disabled={!file || isImporting}
                className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:active:scale-100 transition-colors active:scale-95"
            >
                {isImporting ? 'Importing...' : 'Import Data'}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default CSVImportModal;