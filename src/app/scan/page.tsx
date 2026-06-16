"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates(data.candidates || []);
      } else {
        setError(data.error || "Scan failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>Smart Image Scan</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
          Upload a photo of an item to instantly search our database for visual matches.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--card-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '3rem' }}>
        <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ width: '100%', padding: '1rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}
            disabled={loading}
          />
          <button type="submit" className="btn-primary" disabled={loading || !file} style={{ width: '200px', padding: '0.75rem', fontSize: '1.1rem' }}>
            {loading ? "Scanning..." : "Scan Image"}
          </button>
        </form>
        {error && <p style={{ color: 'var(--error)', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
      </div>

      {candidates.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Top {candidates.length} Candidate Matches</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {candidates.map((candidate) => (
              <Link href={`/reports/${candidate.report.id}`} key={candidate.report.id} style={{ display: 'block', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                {candidate.report.images[0] && (
                  <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: 'var(--bg-color)' }}>
                    <Image src={candidate.report.images[0].url} alt={candidate.report.title} fill style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: candidate.report.type === 'lost' ? 'var(--primary)' : 'var(--secondary)' }}>{candidate.report.type.toUpperCase()}</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>{(candidate.score * 100).toFixed(1)}% Match</span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{candidate.report.title}</h3>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', backgroundColor: 'var(--text-main)' }}>View Match</button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
