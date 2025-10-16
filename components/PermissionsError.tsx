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

  const securityRuleSnippet = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // This function checks if the logged-in user has the 'admin' role.
    // It's REQUIRED for the rules below to work.
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Rule for authenticating admin users
    match /users/{userId} {
      // Admins can list users, and users can read their own data.
      allow read: if isAdmin() || request.auth.uid == userId;
      // Only admins can create, update, or delete other users.
      allow write: if isAdmin();
    }

    // REQUIRED RULE for the 'members' collection
    match /members/{memberId} {
      allow read, write: if isAdmin();
    }

    // REQUIRED RULE for the 'groceries' collection
    match /groceries/{groceryId} {
      allow read, write: if isAdmin();
    }

    // REQUIRED RULE for the 'deposits' collection
    match /deposits/{depositId} {
      allow read, write: if isAdmin();
    }
  }
}`;

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
             <p className="font-mono bg-red-100 p-3 rounded border border-red-200 text-sm">
              <strong>Error:</strong> {errorMessage}
            </p>
            <p>
              This error usually means one of two things is wrong in your Firebase setup. Please check both steps carefully.
            </p>
            
            {/* Step 1: Check User Role */}
            <div className="bg-red-100 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-red-800">Step 1: Your user account isn't an admin.</h4>
                <p className="mt-1">Follow these steps to assign the 'admin' role to your user account (<strong className="font-mono">{user?.email}</strong>).</p>
                <ol className="list-decimal list-inside space-y-2 mt-2 pl-2">
                  <li>Open your project in the <a href="https://console.firebase.google.com/project/messmeal-31a11/firestore/data" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-red-900">Firebase Console</a>.</li>
                  <li>Navigate to the <strong>Firestore Database</strong> &gt; <strong>Data</strong> tab.</li>
                  <li>Select the <strong>'users'</strong> collection.</li>
                  <li>
                    Find the document with this ID (your User UID):
                    <input type="text" readOnly value={user?.uid || 'Loading...'} className="mt-1 p-1 w-full font-mono bg-white border border-red-300 rounded text-sm" />
                  </li>
                  <li>Click on the document and add this field:
                    <ul className="list-disc list-inside ml-6 mt-1 font-mono text-sm">
                        <li>Field name: <code className="bg-white p-1 rounded">role</code></li>
                        <li>Field type: <code className="bg-white p-1 rounded">string</code></li>
                        <li>Field value: <code className="bg-white p-1 rounded">admin</code></li>
                    </ul>
                  </li>
                </ol>
            </div>

            {/* Step 2: Check Security Rules */}
             <div className="bg-red-100 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-red-800">Step 2: Your Firestore Security Rules are incomplete.</h4>
                <p className="mt-1">Your rules need to explicitly grant admin users permission to read and write data. The rules rely on a helper function called <code className="font-mono bg-white p-1 rounded">isAdmin()</code>. You may be missing this function or the rules for the required collections.</p>
                <p className="mt-2">Go to the <strong>Firestore Database</strong> &gt; <strong>Rules</strong> tab and ensure your rules look like the complete example below. You can copy this entire block and paste it to replace your existing rules.</p>
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
              Try Again After Fixing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsError;