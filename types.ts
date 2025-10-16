/**
 * @file types.ts
 * @summary Defines the core data structures used throughout the application.
 */

/**
 * Represents a user in the system, mirroring the Firebase Auth user object
 * with an added custom role. This is for the admin login.
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
  purchaserId: string; // ID of the member who bought it
  purchaserName?: string;
}

/**
 * Represents a deposit made by a member into the shared fund.
 */
export interface Deposit {
  id: string;
  amount: number;
  date: string; // ISO string format
  userId: string; // ID of the member who made the deposit
  userName?: string;
}

/**
 * Represents a participant (member) in the meal sharing group.
 */
export interface Participant {
  id: string; // Corresponds to Firestore document ID in 'members' collection
  name: string;
}

/**
 * Represents a member with all their calculated financial data.
 */
export interface Member extends Participant {
    totalPurchase: number;
    totalDeposit: number;
    balance: number;
}

/**
 * Represents the configuration for the entire site, editable by an admin.
 */
export interface SiteConfig {
  title: string;
  description: string;
  logoUrl: string;
}
