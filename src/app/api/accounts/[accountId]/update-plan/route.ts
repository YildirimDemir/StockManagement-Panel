import { NextRequest, NextResponse } from 'next/server';
import Account from '@/models/accountModel';
import { connectToDB } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';

export const PATCH = async (req: NextRequest, { params }: { params: { accountId: string } }) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Please log in.' },
                { status: 401 }
            );
        }

        const { accountId } = params;
        const { plan } = await req.json();

        if (!mongoose.Types.ObjectId.isValid(accountId)) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Invalid account ID format.' },
                { status: 400 }
            );
        }

        if (!plan || !['Free', 'Pro', 'Business'].includes(plan)) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Invalid or missing plan value.' },
                { status: 400 }
            );
        }

        await connectToDB();
        const account = await Account.findById(accountId);

        if (!account) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Account not found.' },
                { status: 404 }
            );
        }

        if (account.owner.toString() !== token.id) {
            return NextResponse.json(
                { error: 'Forbidden', message: 'Only the owner can update this account.' },
                { status: 403 }
            );
        }

        account.plan = plan;
        await account.save();

        return NextResponse.json(account, { status: 200 });
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: 'Failed to update plan.',
                details: error instanceof Error ? error.message : 'Unknown error occurred.',
            },
            { status: 500 }
        );
    }
};
