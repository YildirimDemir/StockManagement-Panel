import { NextRequest, NextResponse } from 'next/server';
import Account from '@/models/accountModel';
import { connectToDB } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import User from '@/models/userModel';
import { Types } from 'mongoose';

export const GET = async (req: NextRequest) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in.' },
        { status: 401 }
      );
    }

    await connectToDB();

    const userAccounts = await Account.find({
      $or: [{ owner: token.id }, { managers: token.id }]
    }).populate('managers stocks');

    return NextResponse.json(userAccounts, { status: 200 });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch accounts.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};


export const POST = async (req: NextRequest) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in.' },
        { status: 401 }
      );
    }

    const { name, plan } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Account name is required.' },
        { status: 400 }
      );
    }

    await connectToDB();

    const newAccount = new Account({
      name,
      plan: plan || 'Free',
      owner: token.id,
      managers: [],
      stocks: [],
      storageUsed: 0,
    });

    await newAccount.save();

    const user = await User.findById(token.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found.' },
        { status: 404 }
      );
    }

    user.accounts = [...user.accounts, new Types.ObjectId(newAccount._id)];
    await user.save();

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create account.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};