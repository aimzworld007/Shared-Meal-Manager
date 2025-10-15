/**
 * @file types.ts
 * @summary Defines the core data structures and types used throughout the application.
 */

/**
 * Represents a registered user of the application.
 * This is primarily based on Firebase's User object.
 */
export interface User {
  uid: string;
  email: string | null;
}

/**
 * Represents a member of a shared meal group.
 * Members participate in meals and make deposits.
 */
export interface Member {
  id: string;
  name: string;
}

/**
 * Represents a single grocery purchase.
 * The cost is shared among the specified members.
 */
export interface GroceryItem {
  id:string;
  name: string;
  amount: number;
  date: string; // ISO string format for simplicity
  memberIds: string[]; // IDs of members who shared this item
}

/**
 * Represents a deposit made by a member into the shared pool.
 */
export interface Deposit {
  id: string;
  memberId: string;
  amount: number;
  date: string; // ISO string format
}

export type ParsedDeposit = {
    memberName: string;
    amount: number;
    date: string;
};

export type ParsedGrocery = {
    name: string;
    amount: number;
    date: string;
};
