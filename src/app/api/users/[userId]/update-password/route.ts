import { NextRequest, NextResponse } from 'next/server';
import User, { IUser } from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';
import bcrypt from 'bcrypt';
import { getToken } from 'next-auth/jwt';

export const PATCH = async (req: NextRequest, { params }: { params: { userId: string } }) => {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token provided.' }, { status: 401 });
        }

        const { userId } = params;
        if (token.id !== userId) {
            return NextResponse.json({ message: 'Forbidden: You can only update your own password.' }, { status: 403 });
        }

        const { passwordCurrent, newPassword, passwordConfirm } = await req.json();

        if (!passwordCurrent || !newPassword || !passwordConfirm) {
            return NextResponse.json({ message: "All fields are required: current password, new password, and confirmation." }, { status: 400 });
        }

        if (newPassword !== passwordConfirm) {
            return NextResponse.json({ message: "New password and confirmation do not match." }, { status: 400 });
        }

        await connectToDB();

        const user: IUser | null = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(passwordCurrent, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({ message: "Password updated successfully." }, { status: 200 });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
};
