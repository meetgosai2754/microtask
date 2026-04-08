"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [type, setType] = useState("SURVEY");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  const [payouts, setPayouts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "ADMIN")) {
      router.push("/dashboard");
    } else if (session?.user?.role === "ADMIN") {
      fetchPayouts();
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchPayouts = async () => {
    const res = await fetch("/api/payouts");
    if (res.ok) {
      setPayouts(await res.json());
    }
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      setUsers(await res.json());
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, rewardPoints, type, url })
    });
    if (res.ok) {
      setMessage("Task created successfully!");
      setTitle(""); setDescription(""); setRewardPoints(""); setUrl("");
    } else {
      setMessage("Failed to create task");
    }
  };

  if (status === "loading" || !session || session.user.role !== "ADMIN") return <div>Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Administrator Command Center</h2>
        <Link href="/dashboard" className="btn btn-outline">Back to Dashboard</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Create Task Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Deploy New Mission</h3>
          {message && <div style={{ marginBottom: '1rem', color: 'var(--success-color)' }}>{message}</div>}
          <form onSubmit={handleCreateTask}>
            <div className="input-group">
              <label className="input-label">Mission Title</label>
              <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Description (Include details)</label>
              <textarea className="input-field" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Reward Points (Bounty)</label>
              <input type="number" className="input-field" value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Mission Category</label>
              <select className="input-field" style={{ appearance: 'none' }} value={type} onChange={(e) => setType(e.target.value)}>
                <option value="SURVEY">Data Survey</option>
                <option value="VIDEO">Video Campaign</option>
                <option value="APP_TEST">App Testing Beta</option>
                <option value="PARTNER">Promotional Partner (DoorDash/Rakuten)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Redirect URL (Required for automated completion flow)</label>
              <input type="url" className="input-field" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <button type="submit" className="btn" style={{ width: '100%' }}>Deploy Mission globally</button>
          </form>
        </div>

        {/* Top Right Box - Payouts */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Global Checkout Queue</h3>
          {payouts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No pending checkout requests detected on the network.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0' }}>Recipient ID</th>
                    <th>Gross Amount</th>
                    <th>Method/Target</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0' }}>{p.user?.email}</td>
                      <td style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>${p.amount.toFixed(2)}</td>
                      <td>{p.method}</td>
                      <td>
                        <span style={{ 
                          background: p.status === 'PENDING' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(16, 185, 129, 0.2)', 
                          color: p.status === 'PENDING' ? '#facc15' : 'var(--success-color)',
                          padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Database Registered Users Display Row */}
      <div className="glass-card" style={{ marginBottom: '4rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Registered Platform Users ({users.length})</h3>
        {users.length === 0 ? <p>No users registered yet.</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0' }}>Email Address</th>
                  <th>Permission Level</th>
                  <th>Current Balance</th>
                  <th>Missions Completed</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{u.email}</td>
                    <td>
                      <span style={{
                        background: u.role === 'ADMIN' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: u.role === 'ADMIN' ? 'var(--accent-color)' : 'var(--text-main)',
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--success-color)', fontWeight: 700 }}>
                      {u.points.toLocaleString()} pts (${(u.points / 100).toFixed(2)})
                    </td>
                    <td>{u._count.tasksCompleted}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
