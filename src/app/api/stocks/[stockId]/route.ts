import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDB } from '@/lib/mongodb';
import Stock from '@/models/stockModel';
import Account from '@/models/accountModel';
import { Types } from 'mongoose';

export const GET = async (req: NextRequest, { params }: { params: { stockId: string } }) => {
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

    const stock = await Stock.findById(params.stockId).populate('items');
    if (!stock) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Stock not found.' },
        { status: 404 }
      );
    }

    const account = await Account.findById(stock.account);
    if (!account) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Account not found.' },
        { status: 404 }
      );
    }

    const isAuthorized = account.owner.equals(token.id) || account.managers?.some((manager: Types.ObjectId) => manager.equals(token.id));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to access this stock.' },
        { status: 403 }
      );
    }

    return NextResponse.json(stock, { status: 200 });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch stock.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: { stockId: string } }) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in.' },
        { status: 401 }
      );
    }

    const { name, icon } = await req.json();  

    if (!name) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Stock name is required.' },
        { status: 400 }
      );
    }

    await connectToDB();


    const stock = await Stock.findById(params.stockId);
    if (!stock) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Stock not found.' },
        { status: 404 }
      );
    }

    const account = await Account.findById(stock.account);
    if (!account) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Account not found.' },
        { status: 404 }
      );
    }

    const isAuthorized = account.owner.equals(token.id) || account.managers?.some((manager: Types.ObjectId) => manager.equals(token.id));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to update this stock.' },
        { status: 403 }
      );
    }

    stock.name = name;
    stock.icon = icon || stock.icon;  
    await stock.save();

    return NextResponse.json(stock, { status: 200 });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update stock.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: { stockId: string } }) => {
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


    const stock = await Stock.findById(params.stockId);
    if (!stock) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Stock not found.' },
        { status: 404 }
      );
    }


    const account = await Account.findById(stock.account);
    if (!account) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Account not found.' },
        { status: 404 }
      );
    }

    const isAuthorized = account.owner.equals(token.id) || account.managers?.some((manager: Types.ObjectId) => manager.equals(token.id));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You do not have permission to delete this stock.' },
        { status: 403 }
      );
    }


    await stock.deleteOne();

    await Account.updateOne(
      { _id: stock.account },
      { $pull: { stocks: stock._id } }
    );

    return NextResponse.json(
      { message: 'Stock deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to delete stock.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};
