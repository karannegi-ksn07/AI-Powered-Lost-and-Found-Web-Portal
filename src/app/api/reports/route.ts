import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processNewReport } from "@/lib/matchEngine";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await request.json();
    const { type, title, description, category, location, landmark, images, itemDate } = body;

    if (!type || !title || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        userId: user.id,
        type,
        title,
        description: description || "",
        category: category || "Other",
        location,
        landmark,
        itemDate: itemDate ? new Date(itemDate) : undefined,
        images: {
          create: (images || []).map((url: string) => ({ url }))
        }
      },
      include: { images: true }
    });

    // Run ML matching in background
    Promise.resolve().then(() => processNewReport(report.id)).catch(console.error);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // lost or found
    
    const reports = await prisma.report.findMany({
      where: type ? { type } : undefined,
      include: { images: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
