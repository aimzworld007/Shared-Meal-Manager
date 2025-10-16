/**
 * @file types.ts
 * @summary Defines the core data structures used throughout the application.
 */

/**
 * Represents a user in the system, mirroring the Firebase Auth user object.
 * This is for an individual user managing their own meal group.
 */
export interface User {
  uid: string;
  email: string | null;
  isAdmin?: boolean;
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
  id: string; // Corresponds to Firestore document ID in a user's 'members' sub-collection
  name: string;
  phone: string;
  isMealManager?: boolean;
}

/**
 * Represents a member with all their calculated financial data.
 */
export interface Member extends Participant {
    totalPurchase: number;
    totalDeposit: number;
    balance: number;
}

// Fix: Add missing SiteSettings type definition.
/**
 * Represents the global site settings, configurable by an admin.
 */
export interface SiteSettings {
  siteTitle?: string;
  siteDescription?: string;
  logoUrl?: string;
}