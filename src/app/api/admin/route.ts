import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rescanAllReports } from "@/lib/matchEngine";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usersCount = await prisma.user.count();
  const reportsCount = await prisma.report.count();
  const matchesCount = await prisma.match.count();
  const confirmedMatches = await prisma.match.count({ where: { feedback: "approved" } });
  
  // All reports with images
  const allReports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true, user: { select: { email: true, name: true } } }
  });

  // All matches with full report details and images
  const pendingClaims = await prisma.match.findMany({
    where: { feedback: "request_claim" },
    orderBy: { updatedAt: 'desc' },
    include: { 
      lostReport: { include: { images: true, user: { select: { email: true, name: true } } } }, 
      foundReport: { include: { images: true, user: { select: { email: true, name: true } } } } 
    }
  });

  const approvedMatches = await prisma.match.findMany({
    where: { feedback: "approved" },
    orderBy: { updatedAt: 'desc' },
    include: { 
      lostReport: { include: { images: true } }, 
      foundReport: { include: { images: true } } 
    }
  });

  return NextResponse.json({
    metrics: { users: usersCount, reports: reportsCount, matches: matchesCount, confirmed: confirmedMatches },
    allReports,
    pendingClaims,
    approvedMatches
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action, matchId, reportId } = body;

  if (action === "approve" && matchId) {
    await prisma.match.update({ where: { id: matchId }, data: { feedback: "approved" } });
    // Close both reports
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (match) {
      await prisma.report.updateMany({
        where: { id: { in: [match.lostReportId, match.foundReportId] } },
        data: { status: "resolved" }
      });
    }
    return NextResponse.json({ success: true, message: "Match approved and reports closed." });
  }

  if (action === "reject" && matchId) {
    await prisma.match.update({ where: { id: matchId }, data: { feedback: "rejected" } });
    return NextResponse.json({ success: true, message: "Match rejected." });
  }

  if (action === "delete_report" && reportId) {
    await prisma.report.delete({ where: { id: reportId } });
    return NextResponse.json({ success: true, message: "Report deleted." });
  }

  if (action === "rescan") {
    const count = await rescanAllReports();
    return NextResponse.json({ success: true, message: `Re-scan complete. ${count} new matches found.`, count });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
