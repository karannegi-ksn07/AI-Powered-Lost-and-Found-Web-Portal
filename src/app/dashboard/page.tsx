import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { User, Settings, Info, Bell, Plus, CheckCircle, Mail } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      reports: {
        orderBy: { createdAt: 'desc' }
      },
      notifications: {
        where: { status: "pending" },
        include: { match: { include: { lostReport: true, foundReport: true } } }
      }
    }
  });

  // Fetch approved matches where this user's reports are involved
  const approvedMatches = await prisma.match.findMany({
    where: {
      feedback: "approved",
      OR: [
        { lostReport: { userId: user?.id } },
        { foundReport: { userId: user?.id } },
      ]
    },
    include: {
      lostReport: { include: { user: { select: { email: true, name: true } } } },
      foundReport: { include: { user: { select: { email: true, name: true } } } },
    },
    orderBy: { updatedAt: 'desc' }
  });

  if (!user) {
    redirect("/auth");
  } else if (user.role === 'ADMIN') {
    redirect("/admin");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ padding: '0 0.5rem' }}>
        <h1 className="title-main">Hello, {user.name || user.email.split('@')[0]}</h1>
        <p className="text-muted">Manage your reports and matches securely.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Profile Settings */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <User color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Profile Details</h2>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Account Email</div>
            <div style={{ fontWeight: 500, marginTop: '4px' }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Member Since</div>
            <div style={{ fontWeight: 500, marginTop: '4px' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
          <button className="btn-secondary" style={{ marginTop: '1rem', padding: '10px' }} disabled>
            <Settings size={16} style={{ marginRight: '8px' }} /> Preferences
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Approved Matches — Contact Info */}
          {approvedMatches.length > 0 && (
            <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--success)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <CheckCircle color="var(--success)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)' }}>Verified Matches — Contact Info</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {approvedMatches.map((m: any) => {
                  const isLostOwner = m.lostReport.userId === user.id;
                  const otherUser = isLostOwner ? m.foundReport.user : m.lostReport.user;
                  const otherReport = isLostOwner ? m.foundReport : m.lostReport;
                  const myReport = isLostOwner ? m.lostReport : m.foundReport;
                  const scores = JSON.parse(m.scores);
                  return (
                    <div key={m.id} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>✅ Match Verified by Admin</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                            Your <strong>{isLostOwner ? 'lost' : 'found'}</strong> report "{myReport.title}" matched with a <strong>{isLostOwner ? 'found' : 'lost'}</strong> report "{otherReport.title}"
                          </div>
                        </div>
                        <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--success)', color: 'white', fontSize: '13px', fontWeight: 600 }}>
                          {(scores.combinedScore * 100).toFixed(0)}% Match
                        </div>
                      </div>
                      <div style={{ padding: '1.25rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Mail size={18} color="var(--primary)" />
                          <span style={{ fontWeight: 600 }}>{isLostOwner ? 'Found by' : 'Lost by'}:</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {otherUser?.name || otherUser?.email?.split('@')[0]}
                        </div>
                        <a href={`mailto:${otherUser?.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '0.5rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'underline', fontSize: '15px' }}>
                          📧 {otherUser?.email}
                        </a>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '0.75rem' }}>Reach out to coordinate the return of the item.</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notifications */}
          {user.notifications.length > 0 && (
            <div className="glass" style={{ padding: '1.5rem', border: '1px solid var(--primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Bell color="var(--primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>Action Required: Pending Matches ({user.notifications.length})</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {user.notifications.map((notification: any) => (
                  <div key={notification.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>We found a potential match!</div> 
                      <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>For your report "{notification.match.lostReport.userId === user.id ? notification.match.lostReport.title : notification.match.foundReport.title}"</div>
                    </div>
                    <Link href={`/matches/${notification.matchId}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '15px' }}>View Details</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Reports */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Your Reports</h2>
              <Link href="/reports/new" className="btn-primary" style={{ padding: '10px 20px', fontSize: '15px' }}>
                <Plus size={18} style={{ marginRight: '6px' }} /> New Report
              </Link>
            </div>

            {user.reports.length === 0 ? (
              <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', border: '1px dashed var(--text-muted)' }}>
                <Info size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Reports Found</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't reported any lost or found items yet.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <Link href="/reports/new?type=lost" className="btn-primary" style={{ padding: '10px 20px' }}>Report Lost</Link>
                  <Link href="/reports/new?type=found" className="btn-secondary" style={{ padding: '10px 20px' }}>Report Found</Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {user.reports.map((report: any) => (
                  <Link href={`/reports/${report.id}`} key={report.id} className="glass" style={{ display: 'block', padding: '1.5rem', transition: 'all 0.2s ease', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                      <span style={{ 
                        fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em',
                        padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                        backgroundColor: report.type === 'lost' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                        color: report.type === 'lost' ? 'var(--error)' : 'var(--success)'
                      }}>
                        {report.type}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>{report.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {report.description}
                    </p>
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-muted">Status</span>
                      <strong style={{ textTransform: 'capitalize' }}>{report.status}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
