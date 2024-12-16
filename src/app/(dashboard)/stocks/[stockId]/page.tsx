import Items from '@/components/Items/Items';
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
       <Items />
       </>
     ) : (
      <h1 className='text-white'>NO USER</h1>
     )}
    </div>
  )
}