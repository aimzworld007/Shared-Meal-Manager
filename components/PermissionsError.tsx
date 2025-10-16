/**
 * @file PermissionsError.tsx
 * @summary A dedicated component to guide users on how to resolve Firestore permission issues for the multi-user setup.
 */
import React from 'react';

interface PermissionsErrorProps {
  errorMessage: string;
  onRetry: () => void;
}

const PermissionsError: React.FC<PermissionsErrorProps> = ({ errorMessage, onRetry }) => {

  const securityRuleSnippet = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Users can create their own user document, but not edit others'
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
    }

    // A user can only access the data (members, groceries, deposits)
    // that is stored under their own user document.
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}`;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-6 rounded-md shadow-md max-w-4xl mx-auto">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Permissions Error</h3>
          <div className="mt-2 text-md text-red-700 dark:text-red-300 space-y-4">
             <p className="font-mono bg-red-100 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-500/50 text-sm">
              <strong>Error:</strong> {errorMessage}
            </p>
            <p>
              This error means your Firestore Security Rules are not set up correctly to allow you to access your own data. For this app to work, each user should only be able to read and write their own documents.
            </p>
            
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-red-800 dark:text-red-300">How to Fix</h4>
                <p className="mt-1">You need to update your Firestore security rules to protect user data.</p>
                <ol className="list-decimal list-inside space-y-2 mt-2 pl-2">
                  <li>Open your project in the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-red-900 dark:hover:text-red-200">Firebase Console</a>.</li>
                  <li>Navigate to the <strong>Firestore Database</strong> &gt; <strong>Rules</strong> tab.</li>
                  <li>Replace the entire content of the rules editor with the code below. This ensures that users can only access data under their own user ID.</li>
                </ol>
                 <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto mt-2">
                    <code>{securityRuleSnippet}</code>
                </pre>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={onRetry}
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              I've updated the rules, try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsError;