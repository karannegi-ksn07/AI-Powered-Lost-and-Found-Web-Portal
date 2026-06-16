import { prisma } from "./prisma";

/**
 * Word-overlap similarity (Jaccard-like).
 * Splits both strings into words, counts how many words overlap,
 * and returns a ratio between 0 and 1.
 */
function wordSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap++;
  }
  // Normalize by the smaller set so partial descriptions still match well
  return overlap / Math.min(wordsA.size, wordsB.size);
}

/**
 * Core matching function.
 * Weights: Title 40%, Category 20%, Description 20%, Location 20%
 */
function calculateMatch(itemA: any, itemB: any): number {
  let score = 0;

  // Title: word overlap (40%)
  score += wordSimilarity(itemA.title, itemB.title) * 0.40;

  // Category: exact match (20%)
  if (itemA.category?.toLowerCase() === itemB.category?.toLowerCase()) {
    score += 0.20;
  }

  // Description: word overlap (20%)
  score += wordSimilarity(itemA.description, itemB.description) * 0.20;

  // Location: word overlap (20%)
  score += wordSimilarity(itemA.location, itemB.location) * 0.20;

  return score;
}

/**
 * Called automatically when a new report is submitted.
 * Compares the new report against all open reports of the opposite type.
 */
export async function processNewReport(reportId: string) {
  try {
    const newReport = await prisma.report.findUnique({ where: { id: reportId } });
    if (!newReport || newReport.status !== 'open') return;

    console.log(`[Match Engine] Processing new report: ${reportId} ("${newReport.title}")`);

    const targetType = newReport.type === 'lost' ? 'found' : 'lost';
    const candidates = await prisma.report.findMany({
      where: { type: targetType, status: 'open' }
    });

    for (const candidate of candidates) {
      const matchScore = calculateMatch(newReport, candidate);
      console.log(`[Match Engine] ${newReport.title} ↔ ${candidate.title} = ${(matchScore * 100).toFixed(1)}%`);

      if (matchScore >= 0.60) {
        // Check if match already exists
        const existing = await prisma.match.findFirst({
          where: {
            OR: [
              { lostReportId: newReport.type === 'lost' ? newReport.id : candidate.id, foundReportId: newReport.type === 'found' ? newReport.id : candidate.id },
            ]
          }
        });
        if (existing) continue;

        const match = await prisma.match.create({
          data: {
            lostReportId: newReport.type === 'lost' ? newReport.id : candidate.id,
            foundReportId: newReport.type === 'found' ? newReport.id : candidate.id,
            scores: JSON.stringify({ combinedScore: matchScore }),
            feedback: "request_claim"
          }
        });

        console.log(`[Match Engine] ✅ MATCH CREATED (${(matchScore * 100).toFixed(0)}%) → ${match.id}`);

        await prisma.notificationLog.createMany({
          data: [
            { userId: newReport.userId, matchId: match.id, status: "pending" },
            { userId: candidate.userId, matchId: match.id, status: "pending" }
          ]
        });
      }
    }
  } catch (error) {
    console.error("[Match Engine] Error:", error);
  }
}

/**
 * Re-scan ALL open reports to find matches that were missed.
 * Called from the Admin API when needed.
 */
export async function rescanAllReports() {
  console.log("[Match Engine] 🔄 Running full re-scan of all open reports...");

  const lostReports = await prisma.report.findMany({ where: { type: 'lost', status: 'open' } });
  const foundReports = await prisma.report.findMany({ where: { type: 'found', status: 'open' } });

  let created = 0;

  for (const lost of lostReports) {
    for (const found of foundReports) {
      const matchScore = calculateMatch(lost, found);

      if (matchScore >= 0.60) {
        // Check if match already exists
        const existing = await prisma.match.findFirst({
          where: { lostReportId: lost.id, foundReportId: found.id }
        });
        if (existing) continue;

        const match = await prisma.match.create({
          data: {
            lostReportId: lost.id,
            foundReportId: found.id,
            scores: JSON.stringify({ combinedScore: matchScore }),
            feedback: "request_claim"
          }
        });

        await prisma.notificationLog.createMany({
          data: [
            { userId: lost.userId, matchId: match.id, status: "pending" },
            { userId: found.userId, matchId: match.id, status: "pending" }
          ]
        });

        console.log(`[Match Engine] ✅ ${lost.title} ↔ ${found.title} = ${(matchScore * 100).toFixed(0)}%`);
        created++;
      }
    }
  }

  console.log(`[Match Engine] Re-scan complete. ${created} new matches created.`);
  return created;
}
