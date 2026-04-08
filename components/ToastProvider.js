"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const mockEvents = [
  "🎉 User Alex just withdrew $5.00 via GPay!",
  "🚀 Someone just completed the DoorDash task (+2000 pts)",
  "💰 User Priya55 reached VIP status!",
  "🔥 A user just cashed out a $10 Amazon Gift Card",
  "💸 User rahul_22 earned +500 pts from a referral",
  "⭐ Someone completed the Notion AI task (+500 pts)",
  "🏆 Top Earner ranking just changed!"
];

export default function ToastProvider() {
  const [toast, setToast] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only show toasts on the dashboard or public pages, maybe hide on login/register
    if (pathname === '/login' || pathname === '/register') return;

    const showRandomToast = () => {
      const event = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      setToast(event);
      
      // Hide the toast after 4 seconds
      setTimeout(() => {
        setToast(null);
      }, 4000);
    };

    // Show a toast randomly every 15-30 seconds
    const interval = setInterval(() => {
      showRandomToast();
    }, Math.floor(Math.random() * 15000) + 15000);

    return () => clearInterval(interval);
  }, [pathname]);

  if (!toast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid var(--primary-color)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 242, 254, 0.2)',
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      color: 'white',
      fontWeight: '500',
      zIndex: 9999,
      animation: 'slideIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      maxWidth: '350px'
    }}>
      {toast}
      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
