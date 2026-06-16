export const metadata = {
  title: 'Contact Us | Lost & Found Smart',
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>Contact Us</h1>
      
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
          Have a question or need assistance? Fill out the form below and we'll get back to you as soon as possible. You can also reach us at <strong>support@lostfound.app</strong>.
        </p>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="name" style={{ fontWeight: 500, color: 'var(--text-main)' }}>Name</label>
            <input 
              id="name" 
              type="text" 
              required 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '1rem' }} 
              placeholder="Your Full Name"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontWeight: 500, color: 'var(--text-main)' }}>Email</label>
            <input 
              id="email" 
              type="email" 
              required 
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '1rem' }} 
              placeholder="you@example.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="message" style={{ fontWeight: 500, color: 'var(--text-main)' }}>Message</label>
            <textarea 
              id="message" 
              required 
              rows={5}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '1rem', resize: 'vertical' }} 
              placeholder="How can we help you?"
            ></textarea>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
