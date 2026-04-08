import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

const mockTemplates = [
  { title: "Review New App Interface", type: "APP_TEST", url: "https://example.com/app", basePoints: 100 },
  { title: "Provide Feedback on Shopping Habits", type: "SURVEY", url: "https://forms.google.com", basePoints: 50 },
  { title: "Watch Unboxing Video", type: "VIDEO", url: "https://youtube.com", basePoints: 30 },
  { title: "Partner Offer: Play Mobile Game", type: "PARTNER", url: "https://google.com/play", basePoints: 200 },
  { title: "Beta Test Finance Tool", type: "APP_TEST", url: "https://example.com/finance", basePoints: 400 },
];

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { taskId } = await req.json();
    const userId = session.user.id;

    // Check if task exists and user hasn't completed it
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

    const existingCompletion = await prisma.userTask.findFirst({
      where: { userId, taskId }
    });

    if (existingCompletion) {
      return NextResponse.json({ message: "Task already completed" }, { status: 400 });
    }

    // Pick a random new task to replace it so tasks never run out
    const tmpl = mockTemplates[Math.floor(Math.random() * mockTemplates.length)];
    const randomSuffix = Math.floor(Math.random() * 9000) + 1000;

    // Run transaction to add point, complete task, and generate a new one
    await prisma.$transaction([
      prisma.userTask.create({
        data: {
          userId,
          taskId,
          earned: task.rewardPoints,
          status: "COMPLETED"
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { 
          points: { increment: task.rewardPoints },
          lifetimePoints: { increment: task.rewardPoints }
        }
      }),
      prisma.task.create({
        data: {
          title: `${tmpl.title} #${randomSuffix}`,
          description: `This is a newly generated task specifically for you to earn more points!`,
          type: tmpl.type,
          url: tmpl.url,
          rewardPoints: tmpl.basePoints + (Math.floor(Math.random() * 50))
        }
      })
    ]);

    return NextResponse.json({ message: "Task completed successfully", earned: task.rewardPoints }, { status: 200 });
  } catch (error) {
    console.error("Task completion error", error);
    return NextResponse.json({ message: "Error completing task" }, { status: 500 });
  }
}

