/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import * as z from "zod";
import { db } from "@/lib/db";

// Define schema for address wallet updates
const UpdateAddressWalletSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  walletAddress: z.string().min(1, "Address wallet is required"),
});

export const updateAddressWallet = async (
  values: z.infer<typeof UpdateAddressWalletSchema>
): Promise<{ success?: string; error?: string }> => {
  const validatedFields = UpdateAddressWalletSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors.map(e => e.message).join(", "),
    };
  }

  const { userId, walletAddress } = validatedFields.data;

  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: walletAddress,
    });

    return {
      success: `Address wallet updated successfully for user ${updatedUser.id}!`,
    };
  } catch (error) {
    console.error("Error updating address wallet:", error);
    return { error: "Failed to update address wallet. Please try again." };
  }
};
