import { connectToDB } from "@/lib/mongodb";
import User, { IUser } from "@/models/userModel";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server"; 
import { hashPassword } from "@/lib/authBcrypt";
import Account from "@/models/accountModel";

export const GET = async (req: Request) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const nextRequest = req as unknown as NextRequest; 
        const token = await getToken({ req: nextRequest, secret }); 

        if (!token || token.role !== "owner") {
            const loginUrl = new URL('/not-found', req.url); 
            return NextResponse.redirect(loginUrl);
        }
       
        await connectToDB();
        const users: IUser[] = await User.find();

        if (!users) {
            throw new Error("All Users Fetching Fail from MongoDB...");
        }

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json(
            { message: "An unknown error occurred." },
            { status: 500 }
        );
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        const token = await getToken({ req, secret });

        if (!token || token.role !== 'owner') {
            return NextResponse.json({ message: "Only owners can create users." }, { status: 403 });
        }

        const { username, name, email, password, passwordConfirm, accountId } = await req.json();

        if (!username || !name || !email || !email.includes("@") || !password || password.trim().length < 7 || !accountId) {
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

        const account = await Account.findById(accountId);
        if (!account) {
            return NextResponse.json({ message: "Account not found" }, { status: 404 });
        }

        const managerCount = account?.managers?.length || 0;
        const maxManagers = account?.plan === 'Business' ? Infinity : account.plan === 'Pro' ? 2 : 0;

        if (managerCount >= maxManagers) {
            return NextResponse.json({ message: `Cannot add more than ${maxManagers} managers` }, { status: 422 });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({
            username,
            name,
            email,
            password: hashedPassword,
            role: 'manager',
        });

        await newUser.save();

        await Account.updateOne({ _id: accountId }, { $push: { managers: newUser._id } });

        await User.updateOne({ _id: newUser._id }, { $set: { accounts: accountId } });

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