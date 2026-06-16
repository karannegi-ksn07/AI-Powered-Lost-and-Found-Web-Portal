import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    // If not an admin, redirect to normal dashboard or auth
    redirect("/dashboard");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ padding: '1rem', backgroundColor: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 600 }}>Admin Navigation Controls Overridden by Global Layout</h2>
      </div>
      {children}
    </div>
  );
}
