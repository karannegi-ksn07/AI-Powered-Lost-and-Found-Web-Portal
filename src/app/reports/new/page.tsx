"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Calendar, MapPin, Camera, UploadCloud, CheckCircle } from "lucide-react";

const CAMPUS_LOCATIONS = [
  "Library",
  "Hostel",
  "Cafeteria",
  "Auditorium",
  "Parking Area"
];

export default function NewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get("type") === "found" ? "found" : "lost";

  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [itemDate, setItemDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("");
  const [landmark, setLandmark] = useState("");
  
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, description, category, location, landmark, images, itemDate }),
    });

    if (res.ok) {
      setSubmitted(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      alert("Failed to submit report");
    }
  };

  if (submitted) {
    return (
      <div className="glass" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '4rem 2rem', animation: 'fadeIn 0.5s ease' }}>
        <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report securely filed</h2>
        <p className="text-muted">Redirecting you to the dashboard...</p>
        </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ 
          display: 'inline-flex', padding: '6px 16px', borderRadius: 'var(--radius-pill)', 
          backgroundColor: type === "lost" ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)', 
          color: type === "lost" ? 'var(--error)' : 'var(--success)', 
          fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1rem' 
        }}>
          Object Recovery System
        </div>
        <h1 className="title-main" style={{ fontSize: '2.8rem', background: 'linear-gradient(135deg, var(--text-main), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          File a {type === "lost" ? "Lost" : "Found"} Item
        </h1>
        <p className="text-muted" style={{ fontSize: '1.15rem' }}>
          Providing accurate details strongly increases the chances of a match.
        </p>
      </div>

      <div className="glass" style={{ display: 'flex', marginBottom: '2.5rem', padding: '0.5rem', borderRadius: 'var(--radius-pill)' }}>
        <button onClick={() => setType("lost")} style={{ flex: 1, padding: '12px', fontWeight: 600, fontSize: '16px', borderRadius: 'var(--radius-pill)', backgroundColor: type === "lost" ? "var(--error)" : "transparent", color: type === "lost" ? "white" : "var(--text-main)", transition: 'all 0.2s', boxShadow: type === 'lost' ? 'var(--shadow-sm)' : 'none' }}>
          Lost Item
        </button>
        <button onClick={() => setType("found")} style={{ flex: 1, padding: '12px', fontWeight: 600, fontSize: '16px', borderRadius: 'var(--radius-pill)', backgroundColor: type === "found" ? "var(--success)" : "transparent", color: type === "found" ? "white" : "var(--text-main)", transition: 'all 0.2s', boxShadow: type === 'found' ? 'var(--shadow-sm)' : 'none' }}>
          Found Item
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Section 1: Basic Details */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
            <Package size={24} color={type === 'lost' ? "var(--error)" : "var(--success)"} /> Item Identification
          </h3>
          
          <div className="floating-group">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="floating-input" placeholder=" " />
            <label className="floating-label">Primary Object Name (e.g. AirPods Pro)</label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label text-muted">Category Profile</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option>Electronics</option>
                <option>Wallets & Cards</option>
                <option>Keys</option>
                <option>Clothing & Accessories</option>
                <option>Books & Notes</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> Date {type === 'lost' ? 'Lost' : 'Found'}
              </label>
              <input type="date" value={itemDate} onChange={e => setItemDate(e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Section 2: Description */}
        <div className="glass" style={{ padding: '2.5rem' }}>
           <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={24} color={type === 'lost' ? "var(--error)" : "var(--success)"} /> Visual Description
          </h3>
          <div className="floating-group" style={{ marginBottom: 0 }}>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="floating-input" placeholder=" " style={{ resize: 'vertical' }} />
            <label className="floating-label">Include colors, brands, unique marks...</label>
          </div>
        </div>

        {/* Section 3: Details */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={24} color={type === 'lost' ? "var(--error)" : "var(--success)"} /> Proximity & Location
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label text-muted">Campus Zone</label>
              <input type="text" list="campus-locations" value={location} onChange={e => setLocation(e.target.value)} required placeholder="Select or type..." />
              <datalist id="campus-locations">
                {CAMPUS_LOCATIONS.map(loc => <option key={loc} value={loc} />)}
              </datalist>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
               <label className="form-label text-muted">Precise Landmark (Optional)</label>
              <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="e.g. Near table 4" />
            </div>
          </div>
        </div>

        {/* Section 4: Image Upload */}
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Camera size={24} color={type === 'lost' ? "var(--error)" : "var(--success)"} /> Visual Evidence
          </h3>
          <div 
            onDragOver={e => e.preventDefault()} 
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', 
              padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-color)', 
              cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' 
            }}
          >
            <UploadCloud size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Drag & Drop images here</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>Maximum reliability is attained via image evidence.</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleFileUpload(e.target.files)} style={{ display: 'none' }} />
            {uploading && <div className="glass" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><strong style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>Processing Media...</strong></div>}
          </div>

          {images.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <img src={url} alt="Uploaded evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button 
          type="submit" 
          disabled={uploading}
          className="btn-primary"
          style={{ width: '100%', padding: '1.25rem', fontSize: '1.15rem', marginTop: '1rem', background: type === 'lost' ? 'var(--error)' : 'var(--success)' }}
        >
          {type === 'lost' ? 'File Lost Report' : 'Register Found Property'}
        </button>

      </form>
    </div>
  );
}
