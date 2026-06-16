import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string, action: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.redirect(new URL("/auth", request.url));

  const { id, action } = await params;

  if (action !== "confirm" && action !== "reject" && action !== "request_claim") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ 
    where: { id }, 
    include: { lostReport: { include: { user: true } }, foundReport: { include: { user: true } } } 
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  const isAdmin = user?.role === "admin";
  const isLostOwner = session.user.email === match.lostReport.user.email;
  const isFoundOwner = session.user.email === match.foundReport.user.email;

  if (action === "request_claim") {
    if (!isLostOwner && !isFoundOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    // confirm / reject
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 401 });
  }

  // Update Match status
  await prisma.match.update({
    where: { id },
    data: { feedback: action }
  });

  // Mark associated notifications as resolved
  await prisma.notificationLog.updateMany({
    where: { matchId: id },
    data: { status: "resolved" }
  });

  // Redirect back to the match page so it updates locally
  return NextResponse.redirect(new URL(`/matches/${id}`, request.url), 303);
}
