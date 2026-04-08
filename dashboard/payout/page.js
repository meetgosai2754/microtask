"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function PayoutPage() {
  const { data: session, update } = useSession();
  const [pointsToRedeem, setPointsToRedeem] = useState(500);
  const [method, setMethod] = useState("GPAY");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // 100 points = $1
  const usdValue = pointsToRedeem / 100;
  const platformFee = usdValue * 0.10;
  const youGet = usdValue - platformFee;

  const handlePayout = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!paymentDetails.trim()) {
      setIsError(true);
      setMessage("Please enter your payment details (UPI ID or Mobile Number).");
      return;
    }

    const fullMethod = `${method} (${paymentDetails})`;

    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsToRedeem: parseInt(pointsToRedeem), method: fullMethod })
      });
      const data = await res.json();
      if (res.ok) {
        setIsError(false);
        setMessage(`Payment processed successfully! $${youGet.toFixed(2)} has been transferred to your account instantly.`);
        update({ points: session.user.points - pointsToRedeem });
        setPaymentDetails("");
      } else {
        setIsError(true);
        setMessage(data.message);
      }
    } catch (err) {
      setIsError(true);
      setMessage("An error occurred processing your payment. Please try again.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Instant Checkout</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Current Balance: <strong>{session?.user?.points || 0} Points</strong> (${((session?.user?.points || 0) / 100).toFixed(2)})
      </p>

      {message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: isError ? 'rgba(236, 72, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isError ? 'var(--accent-color)' : 'var(--success-color)' }}>
          {message}
        </div>
      )}

      <form onSubmit={handlePayout} className="glass-card">
        <div className="input-group">
          <label className="input-label">Amount to Withdraw (Min 500 = $5)</label>
          <input 
            type="number" 
            min="500"
            max={session?.user?.points || 0}
            step="100"
            className="input-field"
            value={pointsToRedeem}
            onChange={(e) => setPointsToRedeem(e.target.value)}
            required
            disabled={!Math.max(0, session?.user?.points || 0)}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Transfer Method</label>
          <select 
            className="input-field" 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            style={{ appearance: 'none', background: 'rgba(0,0,0,0.4)', backgroundImage: 'linear-gradient(45deg, transparent 50%, gray 50%), linear-gradient(135deg, gray 50%, transparent 50%)', backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat' }}
          >
            <option value="GPAY">Google Pay (GPay)</option>
            <option value="PAYTM">Paytm</option>
            <option value="PHONEPE">PhonePe</option>
            <option value="BHIM_UPI">BHIM UPI</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Payment Details (UPI ID or Mobile Number)</label>
          <input 
            type="text" 
            className="input-field" 
            value={paymentDetails} 
            onChange={(e) => setPaymentDetails(e.target.value)} 
            placeholder="e.g., number@upi or 9876543210"
            required 
            disabled={!Math.max(0, session?.user?.points || 0)}
          />
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Gross Withdrawal:</span> <span>${usdValue.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
            <span>Processing Fee (10%):</span> <span>-${platformFee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <span>Net Transferred to You:</span> <span>${youGet.toFixed(2)}</span>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn" 
          style={{ width: '100%', background: 'linear-gradient(to right, #10b981, #059669)' }}
          disabled={session?.user?.points < 500 || pointsToRedeem < 500}
        >
          {session?.user?.points < 500 ? 'Need 500 points minimum' : 'Withdraw Funds Instantly'}
        </button>
      </form>
    </div>
  );
}
