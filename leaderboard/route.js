import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        lifetimePoints: true,
        _count: {
          select: { tasksCompleted: true }
        }
      },
      orderBy: {
        lifetimePoints: 'desc' // Gamification: rank by total points
      },
      take: 10 // Top 10 leaderboard
    });

    return NextResponse.json(topUsers, { status: 200 });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
