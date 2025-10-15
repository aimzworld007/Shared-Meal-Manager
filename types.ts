/**
 * @file types.ts
 * @summary Defines the core data structures used throughout the application.
 */

/**
 * Represents a user in the system, mirroring the Firebase Auth user object
 * with an added custom role.
 */
export interface User {
  uid: string;
  email: string | null;
  role?: 'admin' | 'user';
}

/**
 * Represents a single grocery item purchased.
 */
export interface GroceryItem {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO string format for dates
  purchaserId: string; // UID of the user who bought it
  purchaserEmail?: string;
}

/**
 * Represents a deposit made by a user into the shared fund.
 */
export interface Deposit {
  id: string;
  amount: number;
  date: string; // ISO string format
  userId: string; // UID of the user who made the deposit
  userEmail?: string;
}

/**
 * Represents a participant (member) in the meal sharing group.
 */
export interface Participant {
  id: string; // Corresponds to User's uid
  email: string;
}

/**
 * Represents a member with all their calculated financial data.
 */
export interface Member extends Participant {
    totalPurchase: number;
    totalDeposit: number;
    balance: number;
}