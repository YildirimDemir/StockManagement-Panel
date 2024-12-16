import { NextRequest, NextResponse } from 'next/server';
import User, { IUser } from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';

export const PATCH = async (req: NextRequest, { params }: { params: { userId: string } }) => {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token provided.' }, { status: 401 });
        }

        const { userId } = params;
        if (token.id !== userId) {
            return NextResponse.json({ message: 'Forbidden: You can only update your own account.' }, { status: 403 });
        }

        const { username, name, email } = await req.json();

        if (!username || !name || !email) {
            return NextResponse.json({ message: "Username, name, and email are required." }, { status: 400 });
        }

        await connectToDB();

        const updatedUser: IUser | null = await User.findByIdAndUpdate(
            userId,
            { username, name, email },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User update failed." }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error updating user info:', error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
};