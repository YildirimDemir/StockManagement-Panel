'use client';

import { userLogout } from '@/services/apiUsers';
import { useRouter } from 'next/navigation';
import Style from './navbar.module.css';
import React, { useState } from 'react'
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Logo from '../../../public/images/stox-logo.png'
import Link from 'next/link';
import Loader from './Loader';

export default function Navbar() {
    
    const {data: session, status} = useSession();
    const user = session?.user
    const router = useRouter();

    const handleLogout = async () => {
      try {
        await userLogout();
        router.push("/");
      } catch (error) {
        console.error(error);
      } finally {
      }
    };

  return (
    <div className={Style.navbar}>
        {status === 'authenticated' && user ? (
            <>
        <div className={Style.sessionUsersName}>
            <p>Welcome, <span className={Style.usersName}>{user?.name}</span></p>
        </div>
        <div className={Style.navbarLogo}>
            <Image src={Logo} alt='' className={Style.logoImg} onClick={() => router.push('/')} />
        </div>
        <div className={Style.navigation}>
            <button className={Style.linkBtn}>
                <Link href='/profile'>Profile</Link>
            </button>
            <button className={Style.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
            </>
        ) : (
            <p className={Style.noUser}>No authenticated user</p>
        )}
    </div>
  )
}