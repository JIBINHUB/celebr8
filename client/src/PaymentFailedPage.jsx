import React, { useEffect, useState } from 'react';

export default function PaymentFailedPage({ onHome }) {
    const isMobile = window.innerWidth <= 768;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setVisible(true), 50);
    }, []);

    const particles = Array.from({ length: 16 }, (_, i) => ({
        left: `${5 + Math.random() * 90}%`,
        delay: `${Math.random() * 1.5}s`,
        duration: `${2 + Math.random() * 2}s`,
        size: `${4 + Math.random() * 6}px`,
    }));

    return (
        <div style={{
            minHeight: '100vh',
            background: '#07070c',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Floating red particles */}
            {particles.map((p, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: p.size,
                    height: p.size,
                    borderRadius: '50%',
                    background: 'rgba(226,55,68,0.5)',
                    left: p.left,
                    top: '-20px',
                    animation: `fall-particle ${p.duration} ${p.delay} linear infinite`,
                    pointerEvents: 'none',
                }} />
            ))}

            {/* Radial glow */}
            <div style={{
                position: 'absolute',
                width: 600, height: 600,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(226,55,68,0.08) 0%, transparent 70%)',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
            }} />

            {/* Card */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0a14, #0a0a14)',
                border: '1px solid rgba(226,55,68,0.3)',
                borderRadius: 28,
                padding: isMobile ? '36px 24px' : '56px 56px',
                textAlign: 'center',
                maxWidth: 480,
                width: '100%',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(226,55,68,0.08)',
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
            }}>

                {/* ✕ Icon with pulsing ring */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 28 }}>
                    <div style={{
                        position: 'absolute',
                        inset: -10,
                        borderRadius: '50%',
                        border: '2px solid rgba(226,55,68,0.25)',
                        animation: 'pulse-ring 2s ease-out infinite',
                    }} />
                    <div style={{
                        width: 88, height: 88,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(226,55,68,0.18), rgba(226,55,68,0.04))',
                        border: '2px solid rgba(226,55,68,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 40,
                        boxShadow: '0 0 40px rgba(226,55,68,0.25)',
                        animation: 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}>✕</div>
                </div>

                <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 900, color: 'white', marginBottom: 12 }}>
                    Payment Failed
                </div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 32 }}>
                    Your payment was not completed. No charges have been made. Your seats have been released.
                </div>

                {/* Reason callout */}
                <div style={{
                    background: 'rgba(226,55,68,0.06)',
                    border: '1px solid rgba(226,55,68,0.18)',
                    borderRadius: 14,
                    padding: '14px 18px',
                    marginBottom: 32,
                    textAlign: 'left',
                }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#e23744', letterSpacing: '1px', marginBottom: 8 }}>POSSIBLE REASONS</div>
                    {['Card declined or insufficient funds', 'Session timeout — please try again quickly', 'Payment cancelled by user'].map((reason, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4, display: 'flex', gap: 8 }}>
                            <span style={{ color: 'rgba(226,55,68,0.6)', flexShrink: 0 }}>›</span>
                            {reason}
                        </div>
                    ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #e23744, #c41f2e)',
                            border: 'none',
                            color: 'white',
                            padding: '14px 20px',
                            borderRadius: 14,
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 8px 24px rgba(226,55,68,0.3)',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(226,55,68,0.45)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(226,55,68,0.3)'; }}
                    >
                        Try Again
                    </button>
                    <button
                        onClick={onHome}
                        style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.6)',
                            padding: '14px 20px',
                            borderRadius: 14,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        Go Home
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fall-particle {
          0% { top: -20px; opacity: 0.7; }
          100% { top: 110vh; opacity: 0; }
        }
      `}</style>
        </div>
    );
}
