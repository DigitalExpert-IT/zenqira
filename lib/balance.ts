import { prisma } from "@/app/api/prisma";
import { TransactionStatus, TransactionType } from "@prisma/client";

export const getUserBalance = async (email: string): Promise<number> => {
  try {

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
    });

    const totalBalance = transactions.reduce((acc, tx) => {
      if (tx.type === TransactionType.DEPOSIT && tx.status === TransactionStatus.SUCCESS) {
        return acc + (tx.valueToken || 0);
      } else if (tx.type === TransactionType.WITHDRAW && tx.status !== TransactionStatus.REJECTED) {
        return acc - (tx.valueToken || 0);
      }
      return acc;
    }, 0);

    return totalBalance;
  } catch (error) {
    console.error("Error fetching user balance:", error);

    return 0;
  }
};
