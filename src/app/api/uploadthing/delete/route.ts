import { options } from "@/lib/auhtOptions";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: Request) {
  const session = await getServerSession(options);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { imageKey } = await req.json();

    if (!imageKey) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const result = await utapi.deleteFiles(imageKey);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error at /api/uploadthing/delete:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
