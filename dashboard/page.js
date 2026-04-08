"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, update } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startedTasks, setStartedTasks] = useState(new Set());

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startTask = (task) => {
    if (task.url) {
      window.open(task.url, "_blank");
    } else {
      alert("Please complete the task instructions described.");
    }
    setStartedTasks(new Set([...startedTasks, task.id]));
  };

  const completeTask = async (taskId) => {
    try {
      const res = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId })
      });
      const data = await res.json();
      if (res.ok) {
        // Update session points context
        update({ points: session.user.points + data.earned });
        alert(`Awesome! You earned ${data.earned} points!`);
        
        // Re-fetch tasks to get the newly generated replacement task!
        fetchTasks();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading available tasks...</div>;

  const userLifetimePts = session?.user?.lifetimePoints || 0;
  const isVip = userLifetimePts >= 5000;
  const referralLink = typeof window !== 'undefined' && session?.user ? `${window.location.origin}/register?ref=${session.user.id}` : '';

  return (
    <div className="animate-fade-in">
      {/* Referral Box Engine */}
      <div className="glass-card" style={{ marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1), rgba(15, 23, 42, 0.8))' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Refer Friends & Earn!</h3>
          <p style={{ margin: 0 }}>Get <strong style={{ color: 'var(--success-color)' }}>+500 points</strong> instantly for every friend who signs up using your link. Your friend also receives a 100-point head start!</p>
        </div>
        <div style={{ flex: '1 1 300px', display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            className="input-field" 
            style={{ marginBottom: 0, opacity: 0.8 }} 
          />
          <button 
            className="btn" 
            onClick={() => {
              navigator.clipboard.writeText(referralLink);
              alert('Referral link copied to clipboard!');
            }}
            style={{ padding: '0 1.5rem' }}
          >
            Copy
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '2rem' }}>Available Microtasks</h2>
        {!isVip && (
          <div style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#facc15', fontSize: '0.9rem', fontWeight: 600 }}>
            Earn {5000 - userLifetimePts} more points to unlock VIP tier tasks!
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <p>No tasks available right now. Check back later!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {tasks.map(task => {
            const isTaskLocked = task.isVipOnly && !isVip;

            return (
              <div key={task.id} className="glass-card" style={{ 
                display: 'flex', flexDirection: 'column', height: '100%',
                position: 'relative', overflow: 'hidden'
              }}>
                {isTaskLocked && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    zIndex: 10, textAlign: 'center', padding: '1.5rem'
                  }}>
                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</span>
                    <h4 style={{ color: '#facc15', fontSize: '1.2rem', marginBottom: '0.5rem' }}>VIP REQUIRED</h4>
                    <p style={{ fontSize: '0.85rem' }}>You need 5,000 lifetime points to claim this high-value task.</p>
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: task.isVipOnly ? '#facc15' : 'white' }}>
                  {task.title} {task.isVipOnly && '⭐'}
                </h3>
                <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}>
                    {task.type}
                  </span>
                </div>
                <p style={{ flex: 1, marginBottom: '1rem', fontSize: '0.9rem' }}>{task.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>+{task.rewardPoints} points</span>
                  {!startedTasks.has(task.id) ? (
                    <button className="btn btn-outline" onClick={() => startTask(task)} disabled={isTaskLocked}>Start Task</button>
                  ) : (
                    <button className="btn" style={{ background: 'var(--success-color)' }} onClick={() => completeTask(task.id)}>Claim Points</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
