export const metadata = {
  title: 'About Us | Lost & Found Smart',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>About Us</h1>
      
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>Purpose of the System</h2>
          <p style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
            Our mission is to create a seamless, efficient, and trustworthy environment for reuniting people with their lost belongings. We leverage modern web technologies to streamline the reporting and claiming processes.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>The Problem It Solves</h2>
          <p style={{ color: 'var(--text-main)', lineHeight: 1.6 }}>
            Traditional lost and found operations are fragmented, relying on manual logs and disjointed physical locations. We centralize this information into a smart system, drastically reducing the time and anxiety involved in finding misplaced items or identifying owners of found items.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>How It Works</h2>
          <ol style={{ paddingLeft: '1.5rem', color: 'var(--text-main)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Report an Item:</strong> Register missing items or log items you have found. Include descriptions, locations, and images.</li>
            <li><strong>AI Matching:</strong> Our system analyzes data (including text descriptions and image embeddings) to suggest potential matches instantly.</li>
            <li><strong>Request a Claim:</strong> If a match is found, users can request a claim by providing necessary verification details.</li>
            <li><strong>Admin Approval & Return:</strong> System administrators review claim requests to ensure security before approving the final return.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
