/**
 * @file PermissionsError.tsx
 * @summary A dedicated component to guide admins on how to resolve Firestore permission issues.
 */
import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface PermissionsErrorProps {
  errorMessage: string;
  onRetry: () => void;
}

const PermissionsError: React.FC<PermissionsErrorProps> = ({ errorMessage, onRetry }) => {
  const { user } = useAuth();

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-md shadow-md max-w-4xl mx-auto">
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Heroicon name: solid/x-circle */}
          <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-bold text-red-800">Admin Permissions Required</h3>
          <div className="mt-2 text-md text-red-700 space-y-4">
            <p>
              The application could not load the required data. This is usually because the currently logged-in user (<strong className="font-mono">{user?.email}</strong>) has not been assigned the 'admin' role in the database.
            </p>
            <p className="font-semibold">To resolve this, please follow these steps:</p>
            <ol className="list-decimal list-inside space-y-2 bg-red-100 p-4 rounded-lg">
              <li>Open your project in the <a href="https://console.firebase.google.com/project/messmeal-31a11/firestore/data" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-red-900">Firebase Console</a>.</li>
              <li>Navigate to the <strong>Firestore Database</strong> section.</li>
              <li>In the 'Data' tab, select the <strong>'users'</strong> collection.</li>
              <li>
                Find the document with the ID that matches your User UID:
                <br />
                <input type="text" readOnly value={user?.uid || 'Loading...'} className="mt-1 p-1 w-full font-mono bg-white border border-red-300 rounded text-sm" />
              </li>
              <li>Click on that document and add a new field:
                <ul className="list-disc list-inside ml-6 mt-1 font-mono">
                    <li>Field name: <code className="bg-white p-1 rounded">role</code></li>
                    <li>Field type: <code className="bg-white p-1 rounded">string</code></li>
                    <li>Field value: <code className="bg-white p-1 rounded">admin</code></li>
                </ul>
              </li>
              <li>Save the changes and then click the 'Try Again' button below.</li>
            </ol>
          </div>
          <div className="mt-6">
            <button
              onClick={onRetry}
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsError;