"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Users, Database, Activity, CheckCircle, XCircle, Trash2, MapPin, Calendar, Tag } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('matches');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchData = () => {
    fetch("/api/admin")
      .then(res => res.json())
      .then(d => {
        if (!d.error) setData(d);
      });
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (action: string, matchId?: string, reportId?: string) => {
    setActionLoading(matchId || reportId || "");
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, matchId, reportId })
    });
    setActionLoading(null);
    fetchData(); // Refresh
  };

  const handleRescan = async () => {
    setScanning(true);
    setScanResult(null);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rescan" })
    });
    const result = await res.json();
    setScanning(false);
    setScanResult(result.message);
    fetchData(); // Refresh data
  };

  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title-main" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShieldCheck color="var(--primary)" size={35} /> Admin Panel
          </h1>
          <p className="text-muted">Review auto-matched items side-by-side. Approve or Reject with one click.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleRescan} disabled={scanning} className="btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', background: scanning ? 'var(--text-muted)' : 'var(--primary)' }}>
            {scanning ? '⏳ Scanning...' : '🔍 Run Auto-Match Scan'}
          </button>
          <div className="glass" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: 'var(--radius-pill)' }}>
            <button onClick={() => setActiveTab('matches')} className={activeTab === 'matches' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 20px' }}>Matches</button>
            <button onClick={() => setActiveTab('all_reports')} className={activeTab === 'all_reports' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 20px' }}>All Reports</button>
            <button onClick={() => setActiveTab('approved')} className={activeTab === 'approved' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 20px' }}>Approved</button>
          </div>
        </div>
      </div>

      {/* Scan Result Banner */}
      {scanResult && (
        <div className="glass" style={{ padding: '1rem 1.5rem', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--success)' }}>✅ {scanResult}</span>
          <button onClick={() => setScanResult(null)} style={{ color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
        {Object.entries(data.metrics).map(([key, val]) => (
          <div key={key} className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>{val as string}</div>
            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '12px', marginTop: '0.75rem', fontWeight: 600 }}>{key}</div>
          </div>
        ))}
      </div>

      {/* Tab: Pending Matches — Side by Side Cards */}
      {activeTab === 'matches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Pending Matches — Verify & Approve</h2>
          </div>

          {data.pendingClaims?.length > 0 ? data.pendingClaims.map((m: any) => {
            const scores = JSON.parse(m.scores);
            const disabled = actionLoading === m.id;
            return (
              <div key={m.id} className="glass" style={{ padding: '2rem', position: 'relative' }}>
                {/* Match Score Badge */}
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', borderRadius: 'var(--radius-pill)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', fontWeight: 700, fontSize: '14px', boxShadow: 'var(--shadow-md)' }}>
                  Match Score: {(scores.combinedScore * 100).toFixed(0)}%
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                  {/* Lost Item */}
                  <ItemCard report={m.lostReport} label="LOST" color="var(--error)" />

                  {/* Divider */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '0 1rem' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>↔</div>
                  </div>

                  {/* Found Item */}
                  <ItemCard report={m.foundReport} label="FOUND" color="var(--success)" />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button onClick={() => handleAction('approve', m.id)} disabled={disabled} className="btn-primary" style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success)' }}>
                    <CheckCircle size={20} /> Approve Match
                  </button>
                  <button onClick={() => handleAction('reject', m.id)} disabled={disabled} className="btn-danger" style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <XCircle size={20} /> Reject
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center' }}>
              <ShieldCheck size={48} color="var(--success)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>All Clear</h3>
              <p className="text-muted">No pending matches to review right now.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: All Reports */}
      {activeTab === 'all_reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Database color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>All Reports ({data.allReports?.length || 0})</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {data.allReports?.map((report: any) => (
              <div key={report.id} className="glass" style={{ padding: '1.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{
                    fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                    backgroundColor: report.type === 'lost' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                    color: report.type === 'lost' ? 'var(--error)' : 'var(--success)'
                  }}>
                    {report.type}
                  </span>
                  <span style={{
                    fontWeight: 500, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                    backgroundColor: report.status === 'open' ? 'rgba(10, 132, 255, 0.1)' : 'rgba(142, 142, 147, 0.1)',
                    color: report.status === 'open' ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    {report.status}
                  </span>
                </div>
                {report.images?.length > 0 && (
                  <img src={report.images[0].url} alt={report.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
                )}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>{report.title}</h3>
                <p className="text-muted" style={{ fontSize: '14px', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{report.description}</p>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span><strong>Category:</strong> {report.category}</span>
                  <span><strong>Location:</strong> {report.location}</span>
                  <span><strong>By:</strong> {report.user?.email || 'Unknown'}</span>
                  <span><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                <button onClick={() => { if(confirm('Delete this report permanently?')) handleAction('delete_report', undefined, report.id) }} style={{ marginTop: '1rem', width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: 'var(--radius-pill)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', background: 'transparent', transition: 'all 0.2s' }}>
                  <Trash2 size={16} /> Delete Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Approved Matches */}
      {activeTab === 'approved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle color="var(--success)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Approved Matches ({data.approvedMatches?.length || 0})</h2>
          </div>
          {data.approvedMatches?.length > 0 ? data.approvedMatches.map((m: any) => {
            const scores = JSON.parse(m.scores);
            return (
              <div key={m.id} className="glass" style={{ padding: '1.5rem', opacity: 0.85 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--error)', textTransform: 'uppercase', marginBottom: '4px' }}>Lost</div>
                    <div style={{ fontWeight: 600 }}>{m.lostReport.title}</div>
                    <div className="text-muted" style={{ fontSize: '13px' }}>{m.lostReport.location}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ background: 'var(--success)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '13px', fontWeight: 600 }}>
                      ✓ {(scores.combinedScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', marginBottom: '4px' }}>Found</div>
                    <div style={{ fontWeight: 600 }}>{m.foundReport.title}</div>
                    <div className="text-muted" style={{ fontSize: '13px' }}>{m.foundReport.location}</div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
              <p className="text-muted">No approved matches yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Reusable Item Detail Card */
function ItemCard({ report, label, color }: { report: any, label: string, color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{
        fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em',
        padding: '4px 12px', borderRadius: 'var(--radius-pill)', alignSelf: 'flex-start',
        backgroundColor: `${color}20`, color: color
      }}>
        {label}
      </div>

      {report.images?.length > 0 && (
        <img src={report.images[0].url} alt={report.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
      )}

      <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{report.title}</h3>
      <p className="text-muted" style={{ fontSize: '14px', lineHeight: 1.5 }}>{report.description || 'No description provided.'}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag size={14} color={color} /> <span className="text-muted">Category:</span> <strong>{report.category}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={14} color={color} /> <span className="text-muted">Location:</span> <strong>{report.location}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color={color} /> <span className="text-muted">Date:</span> <strong>{new Date(report.createdAt).toLocaleDateString()}</strong>
        </div>
        {report.user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color={color} /> <span className="text-muted">By:</span> <strong>{report.user.email}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
