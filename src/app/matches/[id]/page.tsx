import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth");

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      lostReport: { include: { images: true, user: { select: { email: true, name: true } } } },
      foundReport: { include: { images: true, user: { select: { email: true, name: true } } } },
    }
  });

  if (!match) return notFound();

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  const isAdmin = user?.role === "admin";
  const isLostOwner = session.user.email === match.lostReport.user.email;
  const isFoundOwner = session.user.email === match.foundReport.user.email;

  if (!isLostOwner && !isFoundOwner && !isAdmin) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Unauthorized viewing of match records.</div>;
  }

  const scores = JSON.parse(match.scores);
  const contactDetails = match.feedback === "confirm" ? 
    (isLostOwner ? match.foundReport.user.email : match.lostReport.user.email) : null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Match Details</h1>
      
      {match.feedback === "confirm" ? (
        <div style={{ backgroundColor: 'var(--success)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <strong>Match Confirmed!</strong> Contact information has been exchanged. <br/>
          Contact Email: {contactDetails || "Please contact admin for details."}
        </div>
      ) : match.feedback === "reject" ? (
        <div style={{ backgroundColor: 'var(--error)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          This match request was rejected.
        </div>
      ) : match.feedback === "request_claim" ? (
        <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <strong>Claim Requested</strong><br/>
          A claim has been filed for this match and is currently awaiting Admin approval.
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--primary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          <strong>Confidence Score:</strong> {(scores.combinedScore * 100).toFixed(1)}% <br/>
          The system found a highly probable match. Please review the details below.
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Lost Item</h2>
          <p><strong>{match.lostReport.title}</strong></p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{match.lostReport.description}</p>
          {match.lostReport.images[0] && (
            <div style={{ position: 'relative', width: '100%', height: '150px' }}>
              <Image src={match.lostReport.images[0].url} alt="Lost Image" fill style={{ objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: '300px', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>Found Item</h2>
          <p><strong>{match.foundReport.title}</strong></p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{match.foundReport.description}</p>
          {match.foundReport.images[0] && (
             <div style={{ position: 'relative', width: '100%', height: '150px' }}>
             <Image src={match.foundReport.images[0].url} alt="Found Image" fill style={{ objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
           </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {(!match.feedback || match.feedback === "") && !isAdmin && (
           <form action={`/api/matches/${match.id}/request_claim`} method="POST" style={{ flex: 1 }}>
             <button type="submit" className="btn-primary" style={{ width: '100%' }}>Request Claim</button>
           </form>
        )}
        
        {match.feedback === "request_claim" && isAdmin && (
          <>
            <form action={`/api/matches/${match.id}/confirm`} method="POST" style={{ flex: 1 }}>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Approve Claim & Share Contact</button>
            </form>
            <form action={`/api/matches/${match.id}/reject`} method="POST" style={{ flex: 1 }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', backgroundColor: 'var(--error)' }}>Reject Match</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
