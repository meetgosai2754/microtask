"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) setProfile(await res.json());
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) return <div className="container" style={{ paddingTop: '2rem' }}>Loading Profile Matrix...</div>;

  const isVip = profile.lifetimePoints >= 5000;

  return (
    <div className="animate-fade-in container" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '2.5rem' }}>Operative Profile</h2>
        <Link href="/dashboard" className="btn btn-outline">Back to Secure Dashboard</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Security Clearance</h3>
            <div style={{ fontSize: '2rem', color: isVip ? '#facc15' : 'var(--primary-color)', fontWeight: 'bold' }}>
              {isVip ? 'VIP ELITE' : 'STANDARD'}
            </div>
            {!isVip && <p style={{ fontSize: '0.85rem' }}>Earn {5000 - profile.lifetimePoints} more pts for VIP status.</p>}
          </div>
          
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Registered Email</p>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{profile.email}</p>
          </div>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Current Active Balance</p>
            <p style={{ fontWeight: 600, fontSize: '1.3rem', color: 'var(--success-color)' }}>{profile.points} pts (${(profile.points / 100).toFixed(2)})</p>
          </div>
          <div style={{ padding: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Lifetime Earnings Tracker</p>
            <p style={{ fontWeight: 600, fontSize: '1.3rem', color: 'var(--primary-color)' }}>{profile.lifetimePoints} pts (${(profile.lifetimePoints / 100).toFixed(2)})</p>
          </div>
        </div>

        {/* History Tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Withdrawal History */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Withdrawal Ledger</h3>
            {profile.payouts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No withdrawls recorded.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.5rem 0' }}>Date</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.payouts.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.5rem 0' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td>{p.method}</td>
                        <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>${p.amount.toFixed(2)}</td>
                        <td>{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Task History */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Mission Log</h3>
            {profile.tasksCompleted.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No missions completed yet.</p> : (
              <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '0.5rem 0' }}>Date</th>
                      <th>Mission Name</th>
                      <th>Type</th>
                      <th>Bounty Claimed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.tasksCompleted.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.5rem 0' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 500 }}>{t.task.title}</td>
                        <td>{t.task.type}</td>
                        <td style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>+{t.earned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
