'use client';

import { IAccount } from '@/models/accountModel';
import { deleteAccountById, fetchAccountById } from '@/services/apiAccounts';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Style from '../accountsettings.module.css'
import Loader from '@/components/ui/Loader';

export default function DeleteAccount() {
    const { data: session, status } = useSession();
    const user = session?.user;

    const router = useRouter();
    const { accountId } = useParams() as { accountId: string };
    const [account, setAccount] = useState<IAccount | null>(null);
    const [name, setName] = useState(account?.name || '');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
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

    const handleDeleteAccount = async (accountId: string) => {
        if(!account || !user) return;
        setError(null);
        try {
          await deleteAccountById(accountId);
          alert('Account deleted successfully!');
          router.push('/')
        } catch (error: any) {
          setError(error.message)
        }
      }

      if (loading) return <Loader />;
      
  return (
    <div className={Style.updateAccountNameArea}>
      <h3>Delete Account</h3>
      {user?.role === 'owner' ? (
       <div className='flex flex-col align-center'>
        <p className='text-red-500 w-3/4 mx-auto text-center mb-5'>important: All your stocks, items and managers will deleted!!</p>
        <button className='px-3 py-1 bg-red-500 w-28 mx-auto text-white font-bold rounded-lg' onClick={() => handleDeleteAccount(accountId)}>Delete</button>
       </div>
      ) : (
        <h4 className='text-white'>You do not have the authority to do this</h4>
      )}
    </div>
  )
}
