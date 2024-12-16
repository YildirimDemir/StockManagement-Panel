'use client';

import React, { useEffect, useState } from 'react';
import Style from '../accountsettings.module.css';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { IAccount } from '@/models/accountModel';
import { fetchAccountById, updateAccountPlanById } from '@/services/apiAccounts';
import { FaCheck } from 'react-icons/fa';
import Loader from '@/components/ui/Loader';

export default function AccountPlan() {
  const { data: session } = useSession();
  const user = session?.user;
  const { accountId } = useParams() as { accountId: string };
  const [account, setAccount] = useState<IAccount | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Pro' | 'Business'>('Free');
  const [currentPlan, setCurrentPlan] = useState<'Free' | 'Pro' | 'Business'>('Pro'); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const getAccount = async () => {
      try {
        const fetchedAccount = await fetchAccountById(accountId);
        setAccount(fetchedAccount);
        setSelectedPlan(fetchedAccount.plan as 'Free' | 'Pro' | 'Business');
        setCurrentPlan(fetchedAccount.plan as 'Free' | 'Pro' | 'Business'); 
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      getAccount();
    }
  }, [accountId]);

  const handlePlanSelection = (plan: 'Free' | 'Pro' | 'Business') => {
    setSelectedPlan(plan);
  };

  const handleSubmit = async () => {
    if (!account || !user) return;
    
    if (selectedPlan !== currentPlan && (!cardName || !cardNumber || !expiryDate || !cvv)) {
      alert('Please fill out all payment fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateAccountPlanById(accountId, selectedPlan);
      setSuccessMessage('Account plan updated successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = selectedPlan === currentPlan;

  if (loading) return <Loader />;

  return (
    <div className={Style.updateAccountPlanArea}>
      <h3>Account Plan</h3>
      {user?.role === 'owner' ? (
        <>
          <div className={Style.plans}>
            {['Free', 'Pro', 'Business'].map((plan) => (
              <div
                key={plan}
                className={`${Style.planBox} ${
                  selectedPlan === plan ? Style.selected : ''
                }`}
                onClick={() => handlePlanSelection(plan as 'Free' | 'Pro' | 'Business')}
                style={{
                  borderColor: selectedPlan === plan ? 'var(--orange)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                  {currentPlan === plan && (
                    <div className={Style.currentLabel}>Current</div>
                  )}
                <h2>{plan.toUpperCase()}</h2>
                <h4>{plan === 'Free' ? '$0/mo' : plan === 'Pro' ? '$19/mo' : '$50/mo'}</h4>
                <p><FaCheck /> {plan === 'Free' ? '1 User' : plan === 'Pro' ? '3 Users' : 'Unlimited Users'}</p>
                <p><FaCheck /> {plan === 'Free' ? 'Max 5 Stock List' : plan === 'Pro' ? 'Max 30 Stock List' : 'Unlimited Stock List'}</p>
                <p><FaCheck /> {plan === 'Free' ? 'Max 20 Items' : plan === 'Pro' ? 'Max 100 Items' : 'Unlimited Items'}</p>
                <p><FaCheck /> {plan === 'Free' ? '5 GB Storage' : plan === 'Pro' ? '20 GB Storage' : '50 GB Storage'}</p>
                <p><FaCheck /> {plan === 'Free' ? 'Basic Features' : plan === 'Pro' ? 'Advanced Features' : 'All Features & Support'}</p>
                {plan === 'Business' && (
                  <p><FaCheck /> Priority Support</p>
                )}
              </div>
            ))}
          </div>

          {selectedPlan !== currentPlan && (
            <div className={Style.payment}>
              <h2>Payment Information</h2>
              <input
                type="text"
                placeholder="Card Name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                required
              />
              <div className={Style.cardSecret}>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength={3}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="button"
            className={Style.btn}
            onClick={handleSubmit}
            disabled={loading || isButtonDisabled}
          >
            {loading ? 'Updating...' : 'Confirm'}
          </button>

          {error && <p className={Style.errorMessage}>{error}</p>}
          {successMessage && <p className={Style.successMessage}>{successMessage}</p>}
        </>
      ) : (
        <h4 className="text-white">You do not have the authority to do this</h4>
      )}
    </div>
  );
}
