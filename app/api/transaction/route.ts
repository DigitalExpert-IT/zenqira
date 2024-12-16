import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { TransactionStatus, TransactionType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      console.error("No session found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";

    const whereClause = {
      userId: session.user.id,
    };

    const whereClauseCount = {
      status: TransactionStatus.SUCCESS,
      type: TransactionType.DEPOSIT,
    };

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const totalRecords = await db.transaction.count({ where: whereClause });

    const totalPages = Math.ceil(totalRecords / limit);

    const totalTransactionValue = isAdmin
      ? await db.transaction.aggregate({
        _sum: {
          value: true,
        },
        where: whereClauseCount,
      })
      : null;

    let transactions;

    if (!isAdmin) {
      transactions = await db.transaction.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      transactions = await db.transaction.findMany({
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      });
    }


    return NextResponse.json({
      transactions,
      totalPages,
      currentPage: page,
      ...(isAdmin && {
        totalTransactionValue: totalTransactionValue?._sum.value,
      }),
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
