import Link from 'next/link';
import { ArrowRight, Search, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '3.5rem', marginTop: '6rem' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', animation: 'fadeIn 0.6s ease-out' }}>
        <div style={{ 
          display: 'inline-flex', padding: '6px 16px', borderRadius: 'var(--radius-pill)', 
          backgroundColor: 'rgba(0, 113, 227, 0.1)', color: 'var(--primary)', 
          fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1rem' 
        }}>
          Smarter Object Recovery
        </div>
        <h1 className="title-main" style={{ fontSize: '4.5rem', lineHeight: 1.05, maxWidth: '850px', background: 'linear-gradient(135deg, var(--text-main), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Find what you lost.<br />Return what you found.
        </h1>
        <p className="text-muted" style={{ fontSize: '1.35rem', maxWidth: '600px', fontWeight: 400 }}>
          Connecting lost items with their rightful owners using an intelligent AI matching system and strict security verifications.
        </p>
        
        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
          <Link href="/auth" className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
            Get Started
          </Link>
          <Link href="/about" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '18px' }}>
            Learn More
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', justifyItems: 'center', justifyContent: 'center', marginTop: '6rem', width: '100%' }}>
        <FeatureCard 
          icon={<Search size={36} color="var(--primary)" />} 
          title="Smart Matching" 
          desc="AI-powered algorithms instantly surface potential matches between lost and found items." 
        />
        <FeatureCard 
          icon={<ShieldCheck size={36} color="var(--primary)" />} 
          title="Strict Verification" 
          desc="Admin-reviewed claims ensure high security and safe returns to rightful owners." 
        />
        <FeatureCard 
          icon={<HeartHandshake size={36} color="var(--primary)" />} 
          title="Community Driven" 
          desc="Foster a trustworthy campus environment by helping peers find belongings." 
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass" style={{ 
      padding: '2.5rem', 
      width: '320px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '1.25rem',
      textAlign: 'center'
    }}>
      <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: '50%', boxShadow: 'var(--shadow-sm)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h3>
      <p className="text-muted" style={{ fontSize: '15px', lineHeight: 1.5 }}>{desc}</p>
    </div>
  )
}
