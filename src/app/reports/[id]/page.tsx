import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const report = await prisma.report.findUnique({
    where: { id },
    include: { images: true, user: { select: { name: true, email: true } } }
  });

  if (!report) return notFound();

  const isOwner = session?.user?.email === report.user.email;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem' }}>{report.title}</h1>
        <span style={{ padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: report.type === 'lost' ? 'var(--primary)' : 'var(--secondary)', color: 'white', textTransform: 'capitalize' }}>
          {report.type}
        </span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 250px', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Description</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{report.description || "No description provided."}</p>
          
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Images</h3>
          {report.images.length > 0 ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {report.images.map((img: any) => (
                <div key={img.id} style={{ position: 'relative', width: '200px', height: '200px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <Image src={img.url} alt="Report attachment" fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No images available.</p>
          )}
        </div>

        <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Details</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <li><strong>Category:</strong> {report.category}</li>
            <li><strong>Status:</strong> <span style={{ textTransform: 'capitalize', color: report.status === 'open' ? 'var(--success)' : 'inherit' }}>{report.status}</span></li>
            <li><strong>Reported By:</strong> {report.user.name || "Anonymous"}</li>
            <li><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</li>
            <li><strong>Location:</strong> {report.location}</li>
            {report.landmark && <li><strong>Landmark:</strong> {report.landmark}</li>}
          </ul>

          <div style={{ marginTop: '2rem' }}>
            {isOwner ? (
              <button disabled className="btn-primary" style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}>Edit Report (Owner)</button>
            ) : (
              <button className="btn-primary" style={{ width: '100%', backgroundColor: 'var(--secondary)' }}>Contact / Claim</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
