import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// 100 points = $1. Minimum payout 500 points ($5).
const POINTS_PER_USD = 100;
const MIN_PAYOUT_AMOUNT = 5;

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const { pointsToRedeem, method } = await req.json();

    if (!pointsToRedeem || pointsToRedeem < (MIN_PAYOUT_AMOUNT * POINTS_PER_USD)) {
      return NextResponse.json({ message: `Minimum payout is $${MIN_PAYOUT_AMOUNT} (${MIN_PAYOUT_AMOUNT * POINTS_PER_USD} points)` }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.points < pointsToRedeem) {
      return NextResponse.json({ message: "Insufficient points" }, { status: 400 });
    }

    // Calculate details
    const totalUsdValue = pointsToRedeem / POINTS_PER_USD;
    const stripeCommission = totalUsdValue * 0.10; // 10% platform fee
    const payoutAmountUsd = totalUsdValue - stripeCommission;

    // Transaction to deduct points and create request
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { points: { decrement: pointsToRedeem } }
      }),
      prisma.payoutRequest.create({
        data: {
          userId,
          points: pointsToRedeem,
          amount: payoutAmountUsd,
          method,
          status: "PENDING"
        }
      })
    ]);

    // Setup Stripe Mock Logic placeholder here
    console.log(`MOCK STRIPE: Platform earned $${stripeCommission.toFixed(2)} commission.`);
    
    return NextResponse.json({ 
      message: "Payout requested successfully", 
      amountUsd: payoutAmountUsd.toFixed(2), 
      commissionUsd: stripeCommission.toFixed(2) 
    }, { status: 201 });

  } catch (error) {
    console.error("Payout error", error);
    return NextResponse.json({ message: "Error processing payout" }, { status: 500 });
  }
}

// GET all payouts for Admin
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const payouts = await prisma.payoutRequest.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(payouts);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching payouts" }, { status: 500 });
  }
}
