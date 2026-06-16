import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Providers } from '@/components/Providers';
import LogoutButton from '@/components/LogoutButton';
import { ThemeToggle } from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lost & Found Smart',
  description: 'AI-powered lost and found matching platform.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <header className="glass" style={{
            position: 'sticky', top: '10px', zIndex: 50, 
            maxWidth: '1200px', margin: '10px auto', borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-color)',
            padding: '0 20px',
            backgroundColor: 'var(--card-bg)'
          }}>
            <div className="navbar-container">
              <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Lost & Found
              </Link>
              <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link href="/" style={{ fontWeight: 500, fontSize: '15px' }}>Home</Link>
                {session ? (
                  <>
                    <Link href="/dashboard" style={{ fontWeight: 500, fontSize: '15px' }}>Dashboard</Link>
                    <Link href="/reports/new" style={{ fontWeight: 500, fontSize: '15px' }}>Report Item</Link>
                    <LogoutButton />
                  </>
                ) : (
                  <Link href="/auth" className="btn-primary" style={{ padding: '8px 20px', fontSize: '15px' }}>Sign In</Link>
                )}
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
