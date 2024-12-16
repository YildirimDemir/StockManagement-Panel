"use client";
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Session } from 'next-auth';

interface NextSessionProviderProps {
    children: ReactNode;
    session: Session | null | undefined; 
}

export default function NextSessionProvider({ children, session }: NextSessionProviderProps) {
    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    );
}
