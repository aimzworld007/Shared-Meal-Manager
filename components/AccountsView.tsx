/**
 * @file AccountsView.tsx
 * @summary A component that aggregates the main balance summary, deposit history, and individual accounts into a single view.
 */
import React from 'react';
import MainBalanceSummary from './BalanceSummary';
import MemberAndDepositManager from './MemberAndDepositManager';
import IndividualAccounts from './IndividualAccounts';
import { useMealManager } from '../hooks/useMealManager';
import { Deposit } from '../types';

interface AccountsViewProps {
  mealManager: ReturnType<typeof useMealManager>;
  onEditDeposit: (deposit: Deposit) => void;
}

const AccountsView: React.FC<AccountsViewProps> = ({ mealManager, onEditDeposit }) => {
  const { summary } = mealManager;

  return (
    <div className="space-y-8">
      <MainBalanceSummary summary={summary} />
      <MemberAndDepositManager
        deposits={summary.allDeposits}
        onEditDeposit={onEditDeposit}
        onDeleteDeposit={mealManager.deleteDepositItem}
      />
      <IndividualAccounts
        members={summary.members}
        groceries={summary.allGroceries}
      />
    </div>
  );
};

export default AccountsView;
