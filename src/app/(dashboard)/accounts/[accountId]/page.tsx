import Account from '@/components/Account/Account';
import { options } from '@/lib/auhtOptions';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function page() {
  const session = await getServerSession(options);

  if(!session){
    redirect('/login')
  }

  return (
    <div>
     {session ? (
      <>
       <Account />
       </>
     ) : (
      <h1 className='text-white'>NO AUTH</h1>
     )}
    </div>
  )
}