"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{ fontWeight: 500, color: 'var(--text-muted)' }}
    >
      Sign Out
    </button>
  );
}
