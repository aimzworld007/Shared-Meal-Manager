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
  currency?: string;
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
  notes?: string; // For balance transfers
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

// FIX: Added SiteSettings interface for admin-configurable site-wide settings.
export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  logoUrl: string;
}

export interface Period {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'archived';
    type: 'monthly' | 'weekly';
}

export interface SummaryData {
    totalMembers: number;
    totalGroceryCost: number;
    totalDeposits: number;
    averageExpense: number;
    periodName: string;
    periodStartDate: string;
    periodEndDate: string;
}

export interface ArchiveData {
    members: Member[];
    groceries: GroceryItem[];
    deposits: Deposit[];
    summary: SummaryData;
}

export interface Archive {
    id: string; // Corresponds to the periodId
    periodName: string;
    archivedAt: string; // ISO string
    periodStartDate: string;
    periodEndDate: string;
    data: ArchiveData;
}

/**
 * Represents a task or reminder for the group.
 */
export interface Reminder {
  id: string;
  title: string;
  dueDate: string; // ISO string format for date and time
  isComplete: boolean;
  createdAt: string; // ISO string
}

/**
 * Represents an item on the shared shopping list.
 */
export interface ShoppingListItem {
    id: string;
    name: string;
    isComplete: boolean;
    addedAt: string; // ISO string
    addedBy: string; // Member name
}