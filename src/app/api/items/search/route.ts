import { connectToDB } from "@/lib/mongodb";
import Item, { IItem } from "@/models/itemModel";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim() || '';

    try {
        await connectToDB();

        const items: IItem[] = await Item.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
            ]
        });

        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
};
