import { NextRequest, NextResponse } from 'next/server';
import Account from '@/models/accountModel';
import { connectToDB } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import mongoose from 'mongoose';
import User from '@/models/userModel';

export const GET = async (req: NextRequest, { params }: { params: { accountId: string } }) => {
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
  
      if (!mongoose.Types.ObjectId.isValid(accountId)) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid account ID format.' },
          { status: 400 }
        );
      }
  
      await connectToDB();
      const account = await Account.findById(accountId)
      .populate({
        path: 'stocks',
        populate: {
          path: 'items',
          model: 'Item',
        },
      })
      .populate('owner', 'name')
      .populate('managers stocks')
  
      if (!account) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Account not found.' },
          { status: 404 }
        );
      }
  
      const tokenIdAsObjectId = new mongoose.Types.ObjectId(token.id);
  
      if (
        !account.owner.equals(tokenIdAsObjectId) &&
        (!account.managers || !account.managers.some(manager => manager.equals(tokenIdAsObjectId)))
      ) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Access denied to this account.' },
          { status: 403 }
        );
      }
  
      return NextResponse.json(account, { status: 200 });
    } catch (error) {
      console.error('Error fetching account:', error);
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to fetch account.',
          details: error instanceof Error ? error.message : 'Unknown error occurred.',
        },
        { status: 500 }
      );
    }
};

export const DELETE = async (req: NextRequest, { params }: { params: { accountId: string } }) => {
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

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid account ID format.' },
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
        { error: 'Forbidden', message: 'Only the owner can delete this account.' },
        { status: 403 }
      );
    }

    await User.updateOne(
      { _id: token.id },
      { $pull: { accounts: accountId } }
    );

    await Account.findByIdAndDelete(accountId);

    return NextResponse.json(
      { message: 'Account deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to delete account.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};