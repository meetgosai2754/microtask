import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password, name, ref } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let initialPoints = 0;

    // Check if referral code is valid
    if (ref) {
      const referrer = await prisma.user.findUnique({ where: { id: ref } });
      if (referrer) {
        initialPoints = 100; // Sign-up bonus for being referred
        
        // Grant points to the referrer
        await prisma.user.update({
          where: { id: referrer.id },
          data: { 
            points: { increment: 500 },
            lifetimePoints: { increment: 500 }
          }
        });
      }
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        points: initialPoints,
        lifetimePoints: initialPoints,
        role: "USER"
      }
    });

    return NextResponse.json({ message: "User registered successfully", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration." }, { status: 500 });
  }
}
