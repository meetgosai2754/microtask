"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return <div className="container" style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <nav style={{ background: 'var(--surface-color)', padding: '1rem', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-color)' }}>
          Microtasks
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Tasks</Link>
          <Link href="/leaderboard" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Leaderboard</Link>
          <Link href="/profile" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Profile</Link>
          <Link href="/dashboard/payout" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Payouts</Link>
          {session.user.role === 'ADMIN' && (
            <Link href="/admin" style={{ color: 'var(--accent-color)' }}>Admin</Link>
          )}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '99px', color: 'var(--success-color)', fontWeight: 600 }}>
            {session.user.points} Pts
          </div>
          <button onClick={() => signOut()} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Logout</button>
        </div>
      </nav>
      <main className="container" style={{ paddingTop: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
