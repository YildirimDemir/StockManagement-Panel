'use client';

import { IAccount } from '@/models/accountModel';
import { fetchAccountById, updateAccountById } from '@/services/apiAccounts';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Style from '../accountsettings.module.css'
import { getSession, useSession } from 'next-auth/react';
import { options } from '@/lib/auhtOptions';
import Loader from '@/components/ui/Loader';

export default function AccountName() {

  const { data: session, status } = useSession();
  const user = session?.user;

  const { accountId } = useParams() as { accountId: string };
  const [account, setAccount] = useState<IAccount | null>(null);
  const [name, setName] = useState(account?.name || '');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const getAccount = async () => {
      try {
        const fetchedAccount = await fetchAccountById(accountId);
        setAccount(fetchedAccount);
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

  useEffect(() => {
    if (account) {
      setName(account?.name || '');
    }
  }, [account]);

  const handleSubmit = async () => {
    if(!account || !user) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateAccountById(accountId, name);
      setSuccessMessage('Account name updated successfully!');
    } catch (error: any) {
      setError(error.message)
    } finally{
      setLoading(false)
    }
  }

  if (loading) return <Loader />;

  return (
    <div className={Style.updateAccountNameArea}>
      <h3>Account Name</h3>
      {user?.role === 'owner' ? (
        <form onSubmit={(e) => e.preventDefault()}>
         <div className={Style.inputBox}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter new name here..."
          />
        </div>
        <button
          type="button"
          className={Style.btn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Confirm'}
        </button>
        {error && <p className={Style.errorMessage}>{error}</p>}
        {successMessage && <p className={Style.successMessage}>{successMessage}</p>}
        </form>
      ) : (
        <h4 className='text-white'>You do not have the authority to do this</h4>
      )}
    </div>
  )
}
