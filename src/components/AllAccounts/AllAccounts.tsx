'use client';

import React, { useEffect, useState } from 'react'
import Style from './allaccounts.module.css'
import { fetchUserAccounts } from '@/services/apiAccounts';
import { IAccount } from '@/models/accountModel';
import { FaPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loader from '../ui/Loader';

export default function AllAccounts() {

  const router = useRouter();

  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAccounts = async () => {
      try {
        const data = await fetchUserAccounts();
        console.log('Fetched accounts:', data); 
        setAccounts(data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    getAccounts();
  }, []);

  if (loading) return <Loader />;
  
  return (
    <div className={Style.allAccountsArea}>
        <h1>All Accounts</h1>
        {accounts.length > 0 ? (
          <div className={Style.allAccounts}>
           <div className={Style.boxArea}>
           <div className={Style.singleAccountBox} onClick={() => router.push('/create-account')}>
              <h3> <FaPlus /> </h3>
            </div>
            {accounts.map((account) => (
              <div className={Style.singleAccountBox} key={account._id} onClick={() => router.push(`/accounts/${account._id}`)}>
                <h2>{account.name}</h2>
                <p>{account.stocks.length} stock list</p>
                <p>{account.managers?.length} managers</p>
                <span>{account.plan} Plan</span>
              </div>
            ))}
           </div>
          </div>
        ) : (
          <div className={`${Style.allAccounts} ${Style.noAccounts}`}>
            <div className={Style.boxArea}>
            <div className={Style.singleAccountBox} onClick={() => router.push('/create-account')}>
              <h3> <FaPlus /> </h3>
            </div>
            </div>
          </div>
        )}
    </div>
  )
}