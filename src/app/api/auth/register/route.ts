import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/authBcrypt';
import User from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export const POST = async (req: NextRequest) => {
    try {
        const { username, name, email, password, passwordConfirm, role } = await req.json(); 

        if (!username || !name || !email || !email.includes("@") || !password || password.trim().length < 7 || !role) {
            return NextResponse.json({ message: "Invalid input." }, { status: 422 });
        }

        await connectToDB();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User exists already!" }, { status: 422 });
        }

        if (password !== passwordConfirm) {
            return NextResponse.json({ message: "Passwords are not the same!" }, { status: 422 });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({
            username,
            name,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        return NextResponse.json({ message: "User Created" }, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error creating user:', error.message);
            return NextResponse.json({ message: 'Failed to create user', details: error.message }, { status: 500 });
        } else {
            console.error('An unknown error occurred');
            return NextResponse.json({ message: 'Failed to create user', details: 'An unknown error occurred' }, { status: 500 });
        }
    }
};
