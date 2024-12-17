import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { role } = session.user;

  if (role === "ADMIN") { // as Admin Action
    try {
      const { id: txId } = await req.json();

      if (!txId) return NextResponse.json({ error: "Required Transaction Id" }, { status: 500 });

      const tx = await prisma.transaction.update({ where: { id: txId }, data: { status: "SUCCESS" } });

      return NextResponse.json(tx, { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { error: `Failed to bypass buy: ${error}` },
        { status: 500 }
      );
    }
  }
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
