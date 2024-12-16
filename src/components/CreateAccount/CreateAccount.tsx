'use client';

import React, { useState } from 'react';
import Style from './createaccount.module.css';
import { FaCheck } from 'react-icons/fa';
import { createAccount } from '@/services/apiAccounts';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreateAccount() {
  const [accountName, setAccountName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Pro' | 'Business'>('Free');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePlanSelection = (plan: 'Free' | 'Pro' | 'Business') => {
    setSelectedPlan(plan);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (accountName.trim().length < 3) {
      toast.error('Account name must be at least 3 characters long.');
      return;
    }

    if (accountName.trim().length > 15) {
      toast.error('Account name must be no more than 15 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await createAccount(accountName, selectedPlan);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={Style.createAccountPage}>
      <h1>Create Account</h1>
      <div className={Style.createAccountForm}>
        <form onSubmit={handleSubmit}>
          <div className={Style.nameBox}>
            <h2>Account Name</h2>
            <input
              type="text"
              placeholder="Enter account name..."
              maxLength={15}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>

          <div className={Style.selectPlan}>
            <h2>Select Plan</h2>
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
          </div>

          <div className={Style.payment}>
            <h2>Payment</h2>
            <div className={Style.paymentMethod}>
              <input type="text" placeholder='Card Name' />
              <input type="text" placeholder='1234 5678 9012 3456' minLength={19} maxLength={19}/>
              <div className={Style.cardSecret}>
                <input type="text" placeholder='05/25' maxLength={5}/>
                <input type="password" maxLength={3} minLength={3} placeholder='123'/>
              </div>
            </div>
          </div>

          <button className={Style.btn} type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>
    </div>
  );
}
