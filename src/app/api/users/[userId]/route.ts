import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import User, { IUser } from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Account from '@/models/accountModel';

export const GET = async (req: NextRequest, { params }: { params: { userId: string } }) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json({ message: "Authentication required" }, { status: 401 });
        }

        const { userId } = params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
        }

        await connectToDB();
        const user: IUser | null = await User.findById(userId).exec();

        if (!user) {
            return NextResponse.json({ message: "User not found on ID..." }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: 'Failed to fetch user', details: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
};

export const DELETE = async (req: NextRequest, { params }: { params: { userId: string } }) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const token = await getToken({ req, secret });

        if (!token || token.role !== 'owner') {
            return NextResponse.json({ message: "Only owners can delete users" }, { status: 403 });
        }

        const { userId } = params;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
        }

        await connectToDB();
        const deletedUser = await User.findById(userId);

        if (!deletedUser) {
            return NextResponse.json({ message: "User not found on ID..." }, { status: 404 });
        }

        if (deletedUser.role === 'manager') {
            await (Account as any).updateMany(
                { managers: userId },
                { $pull: { managers: userId } } 
            );
        }

        await User.findByIdAndDelete(userId);

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: 'Failed to delete user', details: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
};

