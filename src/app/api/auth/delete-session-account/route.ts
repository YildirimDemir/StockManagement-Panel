import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';
import { getToken } from 'next-auth/jwt';

export const DELETE = async (req: NextRequest) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json({ message: "Unauthorized: Please log in to delete your account." }, { status: 401 });
        }

        const userId = token.id;

        await connectToDB();

        const deletedUser = await User.findByIdAndDelete(userId).exec();

        if (!deletedUser) {
            return NextResponse.json({ message: "User not found or already deleted." }, { status: 404 });
        }

        return NextResponse.json({ message: "Your account has been deleted successfully." }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error deleting account:', error.message);
            return NextResponse.json({ message: 'Failed to delete account', details: error.message }, { status: 500 });
        }
        console.error('An unknown error occurred:', error);
        return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
    }
};
