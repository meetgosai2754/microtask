"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Leaderboard() {
  const { data: session } = useSession();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) setLeaders(await res.json());
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '2rem' }}>Loading Leaderboard...</div>;

  return (
    <div className="animate-fade-in container" style={{ paddingTop: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #facc15, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏆 Global Leaderboard
        </h2>
        <Link href="/dashboard" className="btn btn-outline">Back to Tasks</Link>
      </div>

      <div className="glass-card" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Rank</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>User</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Completed</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>Lifetime Earned</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((user, index) => {
              const isCurrentUser = session?.user?.email === user.email;
              const isTop3 = index < 3;
              
              let rankBadge = `#${index + 1}`;
              if (index === 0) rankBadge = '🥇 Grandmaster';
              if (index === 1) rankBadge = '🥈 Champion';
              if (index === 2) rankBadge = '🥉 Elite';
              
              return (
                <tr key={user.id} style={{ 
                  background: isCurrentUser ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.3s'
                }}>
                  <td style={{ padding: '1rem', fontWeight: isTop3 ? '800' : '500', color: isTop3 ? '#facc15' : 'var(--text-main)' }}>
                    {rankBadge}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    {user.name || user.email.split('@')[0]}
                    {isCurrentUser && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'var(--primary-color)', color: 'black', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>YOU</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>{user._count.tasksCompleted} Missions</td>
                  <td style={{ padding: '1rem', color: 'var(--success-color)', fontWeight: '700' }}>
                    {user.lifetimePoints.toLocaleString()} PTS
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {leaders.length === 0 && <p style={{ padding: '2rem', textAlign: 'center' }}>No data on the network yet.</p>}
      </div>
    </div>
  );
}
