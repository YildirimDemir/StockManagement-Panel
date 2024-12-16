import { NextRequest, NextResponse } from 'next/server';
import Stock from '@/models/stockModel';
import { connectToDB } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';
import Account from '@/models/accountModel';
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

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Account ID is required.' },
        { status: 400 }
      );
    }

    const userAccount = await Account.findOne({
      _id: accountId, 
      $or: [
        { owner: token.id }, 
        { managers: token.id },
      ],
    });

    if (!userAccount) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have access to this account.' },
        { status: 403 }
      );
    }

    const stocks = await Stock.find({ account: accountId }).populate('items');

    return NextResponse.json(stocks, { status: 200 });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch stocks.',
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

    const { name, accountId, icon } = await req.json();

    if (!name || !accountId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Stock name and accountId are required.' },
        { status: 400 }
      );
    }

    const PLAN_LIMITS = {
      Free: 5,
      Pro: 30,
      Business: Infinity, 
    };

    await connectToDB();

    const userAccount = await Account.findOne({
      _id: accountId,
      $or: [{ owner: token.id }, { managers: token.id }],
    });

    if (!userAccount) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have access to this account.' },
        { status: 403 }
      );
    }

    const currentPlan = userAccount.plan || 'Free';
    const stockLimit = PLAN_LIMITS[currentPlan];
    const currentStockCount = userAccount.stocks.length;

    if (currentStockCount >= stockLimit) {
      return NextResponse.json(
        {
          error: 'Plan Limit Reached',
          message: `Your current plan (${currentPlan}) allows a maximum of ${stockLimit} stocks. Upgrade your plan to create more stocks.`,
        },
        { status: 403 }
      );
    }

    const newStock = new Stock({
      name,
      account: accountId,
      items: [],
      storageUsed: 0,
      icon: icon || 'FaCube',
    });

    await newStock.save();

    await Account.updateOne({ _id: accountId }, { $push: { stocks: newStock._id } });

    return NextResponse.json(newStock, { status: 201 });
  } catch (error) {
    console.error('Error creating stock:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to create stock.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};
