import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const params = req.nextUrl.pathname;
    const id = params.split("/").at(-1);

    const body = await req.json();

    const transaction = await db.transaction.update({
      where: {
        id: id as unknown as string,
      },
      data: { ...body }
    });

    return NextResponse.json({
      ...transaction
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
