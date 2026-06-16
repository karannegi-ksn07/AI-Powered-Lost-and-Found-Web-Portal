import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const sp = await searchParams;
  const type = sp.type === 'found' ? 'found' : sp.type === 'lost' ? 'lost' : undefined;
  
  const reports = await prisma.report.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { images: true, user: { select: { name: true } } }
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>{type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Reports` : 'All Reports'}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/reports?type=lost" className="btn-primary" style={{ backgroundColor: type === 'lost' ? 'var(--primary)' : 'var(--text-muted)' }}>Lost</Link>
          <Link href="/reports?type=found" className="btn-primary" style={{ backgroundColor: type === 'found' ? 'var(--secondary)' : 'var(--text-muted)' }}>Found</Link>
          <Link href="/reports" className="btn-primary" style={{ backgroundColor: !type ? 'var(--text-main)' : 'var(--text-muted)' }}>All</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {reports.map((report: any) => (
           <Link href={`/reports/${report.id}`} key={report.id} style={{ display: 'block', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
             {report.images[0] && (
               <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: 'var(--bg-color)' }}>
                 <Image src={report.images[0].url} alt={report.title} fill style={{ objectFit: 'cover' }} />
               </div>
             )}
             <div style={{ padding: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <span style={{ fontWeight: 600, color: report.type === 'lost' ? 'var(--primary)' : 'var(--secondary)', textTransform: 'capitalize' }}>{report.type}</span>
                 <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(report.createdAt).toLocaleDateString()}</span>
               </div>
               <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{report.title}</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.description}</p>
               <div style={{ marginTop: '1rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ color: 'var(--text-muted)' }}>By: {report.user.name || "Anonymous"}</span>
                 <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>{report.category}</span>
               </div>
             </div>
           </Link>
        ))}
        {reports.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>No reports found.</p>
        )}
      </div>
    </div>
  );
}
