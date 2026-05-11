"use server";

import { db } from "@/db";
import { habitsLog, weightLog, workLog, reviewLog } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ════════════════════════════════════════════
// HABITS
// ════════════════════════════════════════════

export async function getHistory() {
  try {
    const records = await db.select().from(habitsLog);
    const historyMap: Record<string, Record<string, boolean>> = {};

    records.forEach((r) => {
      historyMap[r.id] = {
        water: r.water,
        phone_morn: r.phone_morn,
        gym: r.gym,
        photo: r.photo,
        rice: r.rice,
        phone_eve: r.phone_eve,
        journal: r.journal,
      };
    });

    return historyMap;
  } catch (error) {
    console.error("Failed to fetch history", error);
    return {};
  }
}

export async function toggleHabit(dateId: string, habitKey: string) {
  try {
    const existing = await db
      .select()
      .from(habitsLog)
      .where(eq(habitsLog.id, dateId));

    if (existing.length > 0) {
      const currentVal = existing[0][habitKey as keyof (typeof existing)[0]];
      await db
        .update(habitsLog)
        .set({ [habitKey]: !currentVal, updatedAt: new Date() })
        .where(eq(habitsLog.id, dateId));
    } else {
      await db.insert(habitsLog).values({
        id: dateId,
        [habitKey]: true,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle habit", error);
    return { success: false };
  }
}

// ════════════════════════════════════════════
// WEIGHT
// ════════════════════════════════════════════

export type WeightEntry = {
  id: number;
  date: string;
  value: number;
};

export async function getWeightEntries(): Promise<WeightEntry[]> {
  try {
    const records = await db
      .select()
      .from(weightLog)
      .orderBy(desc(weightLog.id));
    return records.map((r) => ({ id: r.id, date: r.date, value: r.value }));
  } catch (error) {
    console.error("Failed to fetch weight entries", error);
    return [];
  }
}

export async function addWeightEntry(date: string, value: number) {
  try {
    await db.insert(weightLog).values({ date, value });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add weight entry", error);
    return { success: false };
  }
}

// ════════════════════════════════════════════
// WORK (Photography)
// ════════════════════════════════════════════

export type WorkEntry = {
  id: number;
  date: string;
  type: string;
  note: string;
  amount: number;
};

export async function getWorkEntries(): Promise<WorkEntry[]> {
  try {
    const records = await db
      .select()
      .from(workLog)
      .orderBy(desc(workLog.id));
    return records.map((r) => ({
      id: r.id,
      date: r.date,
      type: r.type,
      note: r.note,
      amount: r.amount,
    }));
  } catch (error) {
    console.error("Failed to fetch work entries", error);
    return [];
  }
}

export async function addWorkEntry(
  date: string,
  type: string,
  note: string,
  amount: number
) {
  try {
    await db.insert(workLog).values({ date, type, note, amount });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add work entry", error);
    return { success: false };
  }
}

// ════════════════════════════════════════════
// REVIEWS
// ════════════════════════════════════════════

export type ReviewEntry = {
  id: number;
  date: string;
  well: string;
  broke: string;
  goal: string;
};

export async function getReviewEntries(): Promise<ReviewEntry[]> {
  try {
    const records = await db
      .select()
      .from(reviewLog)
      .orderBy(desc(reviewLog.id));
    return records.map((r) => ({
      id: r.id,
      date: r.date,
      well: r.well,
      broke: r.broke,
      goal: r.goal,
    }));
  } catch (error) {
    console.error("Failed to fetch review entries", error);
    return [];
  }
}

export async function addReviewEntry(
  date: string,
  well: string,
  broke: string,
  goal: string
) {
  try {
    await db.insert(reviewLog).values({ date, well, broke, goal });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to add review entry", error);
    return { success: false };
  }
}

// ════════════════════════════════════════════
// DELETE ACTIONS
// ════════════════════════════════════════════

export async function deleteWeightEntry(id: number) {
  try {
    await db.delete(weightLog).where(eq(weightLog.id, id));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete weight entry", error);
    return { success: false };
  }
}

export async function deleteWorkEntry(id: number) {
  try {
    await db.delete(workLog).where(eq(workLog.id, id));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete work entry", error);
    return { success: false };
  }
}

export async function deleteReviewEntry(id: number) {
  try {
    await db.delete(reviewLog).where(eq(reviewLog.id, id));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete review entry", error);
    return { success: false };
  }
}
