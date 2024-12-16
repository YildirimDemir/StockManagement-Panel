import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDB } from '@/lib/mongodb';
import Stock from '@/models/stockModel';
import Account from '@/models/accountModel';
import Item from '@/models/itemModel';
import { Types } from 'mongoose';

export const GET = async (req: NextRequest, { params }: { params: { itemId: string } }) => {
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

    const item = await Item.findById(params.itemId).populate('stock', '_id');
    if (!item) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Item not found.' },
        { status: 404 }
      );
    }

    if (item.stock && item.stock._id) {
      console.log('Stock ID:', item.stock._id.toString()); 
    }


    const stock = await Stock.findById(item.stock._id.toString());
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
        { error: 'Forbidden', message: 'You do not have permission to access this item.' },
        { status: 403 }
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to fetch item.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};

export const PATCH = async (req: NextRequest, { params }: { params: { itemId: string } }) => {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in.' },
        { status: 401 }
      );
    }

    const { name, price, quantity, status, category, image, supplier, unitPrice, wholesalePrice } = await req.json();

    if (!name && !price && !quantity && !status && !category) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'At least one field (name, price, quantity, status, or category) is required to update.' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Item'i bul
    const item = await Item.findById(params.itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Item not found.' },
        { status: 404 }
      );
    }

    const stock = await Stock.findById(item.stock);
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
        { error: 'Forbidden', message: 'You do not have permission to update this item.' },
        { status: 403 }
      );
    }

    item.name = name || item.name;
    item.price = price || item.price;
    item.quantity = quantity || item.quantity;
    item.status = status || item.status;
    item.category = category || item.category;
    item.image = image || item.image;
    item.supplier = supplier || item.supplier;
    item.unitPrice = unitPrice || item.unitPrice;
    item.wholesalePrice = wholesalePrice || item.wholesalePrice;

    await item.save();

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update item.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: { itemId: string } }) => {
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

    const item = await Item.findById(params.itemId);
    if (!item) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Item not found.' },
        { status: 404 }
      );
    }

    const stock = await Stock.findById(item.stock);
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
        { error: 'Forbidden', message: 'You do not have permission to delete this item.' },
        { status: 403 }
      );
    }

    await item.deleteOne();

    await Stock.updateOne({ _id: item.stock }, { $pull: { items: item._id } });

    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to delete item.',
        details: error instanceof Error ? error.message : 'Unknown error occurred.',
      },
      { status: 500 }
    );
  }
};
