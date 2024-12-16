import { connectToDB } from "@/lib/mongodb";
import Account from "@/models/accountModel";
import Item from "@/models/itemModel";
import Stock from "@/models/stockModel";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


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
      const stockId = searchParams.get('stockId');
  
      if (!stockId) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Stock ID is required.' },
          { status: 400 }
        );
      }
  
      const items = await Item.find({ stock: stockId }).populate('stock', '_id');
  
      if (items.length === 0) {
        return NextResponse.json(
          { error: 'Not Found', message: 'No items found for the provided stock.' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(items, { status: 200 });
    } catch (error) {
      console.error('Error fetching items:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to fetch items.' },
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
  
      const {
        name,
        sku,
        image,
        category,
        quantity,
        unitPrice,
        wholesalePrice,
        status,
        supplier,
        stockId,
      } = await req.json();
  
      if (!name || !sku || !stockId) {
        return NextResponse.json(
          { error: 'Bad Request', message: 'Name, sku and stockId are required.' },
          { status: 400 }
        );
      }
  
      await connectToDB();
  
      const stock = await Stock.findById(stockId);
  
      if (!stock) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Stock not found.' },
          { status: 404 }
        );
      }
  
      const account = await Account.findOne({
        _id: stock.account,
        $or: [{ owner: token.id }, { managers: token.id }],
      });
  
      if (!account) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You do not have access to this stock.' },
          { status: 403 }
        );
      }
  
      const PLAN_LIMITS = {
        Free: 20,
        Pro: 100,
        Business: Infinity,
      };
  
      const currentPlan = account.plan || 'Free';
      const itemLimitPerStock = PLAN_LIMITS[currentPlan];
  
      const stockItemCount = stock.items.length;
  
      if (stockItemCount >= itemLimitPerStock) {
        return NextResponse.json(
          {
            error: 'Plan Limit Reached',
            message: `This stock can have a maximum of ${itemLimitPerStock} items.`,
          },
          { status: 403 }
        );
      }
  
      const newItem = new Item({
        name,
        sku,
        image,
        category,
        quantity,
        unitPrice,
        wholesalePrice,
        status,
        supplier,
        stock: stockId,
      });
  
      await newItem.save();
  
      await Stock.updateOne({ _id: stockId }, { $push: { items: newItem._id } });
  
      return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
      console.error('Error creating item:', error);
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Failed to create item.' },
        { status: 500 }
      );
    }
  };
  