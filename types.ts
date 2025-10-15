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
}

/**
 * Represents a deposit made by a user into the shared fund.
 */
export interface Deposit {
  id: string;
  amount: number;
  date: string; // ISO string format
  userId: string; // UID of the user who made the deposit
}

/**
 * Represents a participant in the meal sharing group.
 * In this system, a participant is synonymous with a user.
 */
export interface Participant {
  id: string; // Corresponds to User's uid
  email: string;
}
