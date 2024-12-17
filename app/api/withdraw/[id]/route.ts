import { db } from "@/lib/db";
import { TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.pathname;
    const id = params.split("/").at(-1);

    const transaction = await db.transaction.findUnique({
      where: {
        id: id as unknown as string,
        type: TransactionType.WITHDRAW
      },
      include: {
        user: {
          select: {
            email: true,
            walletAddress: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...transaction
    });
  } catch (error) {
    console.error("Transactions Route Error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
