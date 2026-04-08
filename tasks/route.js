import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    // Fetch tasks that this user hasn't completed yet
    const completedTasks = await prisma.userTask.findMany({
      where: { userId },
      select: { taskId: true }
    });
    
    const completedTaskIds = completedTasks.map(t => t.taskId);

    const availableTasks = await prisma.task.findMany({
      where: {
        id: { notIn: completedTaskIds }
      }
    });

    return NextResponse.json(availableTasks);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching tasks" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, rewardPoints, type, url } = await req.json();

    const task = await prisma.task.create({
      data: {
        title,
        description,
        rewardPoints: parseInt(rewardPoints),
        type,
        url
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating task" }, { status: 500 });
  }
}
