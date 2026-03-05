import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// ─── Single Ticket Card ───────────────────────────────────────────────
function TicketCard({ ticket, event, user, bookingId, index, total }) {
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    // Build QR content: Link to a secure verification page
    const verifyUrl = `${window.location.origin}/verify/${ticket.qrCodeString}`;
    const qrPayload = verifyUrl;

    useEffect(() => {
        QRCode.toDataURL(qrPayload, {
            width: 800, // High res for download
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H'
        }).then(url => setQrDataUrl(url)).catch(() => { });
    }, [qrPayload]);

    const dateStr = event?.date
        ? new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—';

    const handleDownload = async () => {
        if (!qrDataUrl) return;
        setDownloading(true);

        try {
            // Draw full ticket on offscreen canvas
            const W = 760, H = 320;
            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');

            // Enable high-DPI
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Background
            const bg = ctx.createLinearGradient(0, 0, W, H);
            bg.addColorStop(0, '#0a0a16');
            bg.addColorStop(1, '#100d1a');
            ctx.fillStyle = bg;
            // Rounded rect
            const r = 32;
            ctx.beginPath();
            ctx.moveTo(r, 0); ctx.lineTo(W - r, 0);
            ctx.arcTo(W, 0, W, r, r);
            ctx.lineTo(W, H - r);
            ctx.arcTo(W, H, W - r, H, r);
            ctx.lineTo(r, H);
            ctx.arcTo(0, H, 0, H - r, r);
            ctx.lineTo(0, r);
            ctx.arcTo(0, 0, r, 0, r);
            ctx.closePath();
            ctx.fill();

            // Add subtle glow/texture
            const gradient = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W);
            gradient.addColorStop(0, 'rgba(226, 55, 68, 0.05)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, W, H);

            // Left red accent bar
            ctx.fillStyle = '#e23744';
            ctx.fillRect(0, 0, 6, H);

            // Tear-off dashed line
            const divX = W - 220;
            ctx.save();
            ctx.setLineDash([8, 6]);
            ctx.strokeStyle = 'rgba(255,255,255,0.12)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(divX, 24); ctx.lineTo(divX, H - 24);
            ctx.stroke();
            ctx.restore();

            // Semi-circles at tear-off line (notches)
            ctx.fillStyle = '#0a0a16';
            ctx.beginPath(); ctx.arc(divX, -2, 14, 0, Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(divX, H + 2, 14, Math.PI, 0); ctx.fill();

            // ── Left section content ──────────────────────────────────────
            const lx = 30;

            // Celebr8 label
            ctx.fillStyle = '#e23744';
            ctx.font = 'bold 11px -apple-system, Arial';
            ctx.letterSpacing = '3px';
            ctx.fillText('CELEBR8 EVENTS', lx, 44);

            // Title
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 26px -apple-system, Arial';
            ctx.fillText(event?.title || 'The Secret Letter', lx, 80);

            // Subtitle / city
            ctx.fillStyle = 'rgba(226,55,68,0.85)';
            ctx.font = '600 14px -apple-system, Arial';
            ctx.fillText(event?.subtitle || event?.city || '', lx, 102);

            // Info grid ─ 3 columns
            const cols = [lx, lx + 180, lx + 340];
            const rows = [
                [['HOLDER', user?.name || '—'], ['DATE', dateStr], ['SEAT', ticket.seatIdentifier]],
                [['EMAIL', (user?.email || '—').substring(0, 26)], ['VENUE', (event?.venue || '—').substring(0, 20)], ['ZONE', ticket.zone]],
                [['PRICE', `£${ticket.price}`], ['PAYMENT', 'Card (Stripe)'], ['REF', `#${ticket.qrCodeString?.substring(0, 10).toUpperCase() || ''}`]],
            ];

            let gy = 136;
            rows.forEach(row => {
                row.forEach(([label, val], ci) => {
                    ctx.fillStyle = 'rgba(255,255,255,0.35)';
                    ctx.font = 'bold 9px -apple-system, Arial';
                    ctx.fillText(label, cols[ci], gy);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 13px -apple-system, Arial';
                    ctx.fillText(val, cols[ci], gy + 17);
                });
                gy += 52;
            });

            // Booking line bottom-left
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = '10px monospace';
            ctx.fillText(`BOOKING #${bookingId || '—'}   ·   DO NOT SHARE THIS TICKET`, lx, H - 18);

            // Ticket count badge (top right of left section)
            if (total > 1) {
                ctx.fillStyle = 'rgba(226,55,68,0.2)';
                ctx.strokeStyle = 'rgba(226,55,68,0.5)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(divX - 70, 18, 58, 26, 8);
                ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#e23744';
                ctx.font = 'bold 12px -apple-system, Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${index + 1} / ${total}`, divX - 41, 36);
                ctx.textAlign = 'left';
            }

            // ── Right section: QR ────────────────────────────────────────
            const qrX = divX + 20;
            const qrSize = 160;
            const qrY = (H - qrSize) / 2;

            // QR white background rounded (Solid white fixes "invisible in gallery")
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
            ctx.fill();

            // Draw QR image from data URL
            const qrImg = new window.Image();
            qrImg.src = qrDataUrl;
            await new Promise((resolve, reject) => {
                qrImg.onload = resolve;
                qrImg.onerror = reject;
            });
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // "SCAN TO ENTER" text
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.font = 'bold 9px -apple-system, Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SCAN TO ENTER', qrX + (qrSize / 2) + 8, qrY + qrSize + 22);
            ctx.textAlign = 'left';

            // ── Export ────────────────────────────────────────────────────
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `Celebr8_Ticket_${ticket.seatIdentifier?.replace(/[\s-]/g, '_') || 'Ticket'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);

        } finally {
            setDownloading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #0d0d1a 0%, #100c18 100%)',
            border: '1px solid rgba(226,55,68,0.2)',
            borderRadius: 18,
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)',
            maxWidth: 540,
            width: '100%',
            margin: '0 auto',
        }}>
            {/* Left accent */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #e23744, #c0172a)' }} />

            {/* Ticket count badge */}
            {total > 1 && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(226,55,68,0.15)', border: '1px solid rgba(226,55,68,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#e23744', zIndex: 2 }}>
                    {index + 1}/{total}
                </div>
            )}

            <div style={{ display: 'flex', gap: 0 }}>
                {/* ── LEFT: Details ── */}
                <div style={{ flex: 1, padding: '18px 12px 14px 20px', minWidth: 0 }}>
                    {/* Header */}
                    <div style={{ fontSize: 9, letterSpacing: '2.5px', color: '#e23744', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>CELEBR8 EVENTS</div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: 2 }}>
                        {event?.title || 'The Secret Letter'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(226,55,68,0.85)', fontWeight: 700, marginBottom: 14 }}>
                        {event?.subtitle || event?.city}
                    </div>

                    {/* Compact info grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px' }}>
                        {[
                            ['SEAT', ticket.seatIdentifier],
                            ['ZONE', ticket.zone],
                            ['DATE', dateStr],
                            ['VENUE', event?.venue],
                            ['HOLDER', user?.name],
                            ['PRICE', `£${ticket.price}`],
                        ].map(([label, val]) => (
                            <div key={label}>
                                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', fontWeight: 800, textTransform: 'uppercase' }}>{label}</div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val || '—'}</div>
                            </div>
                        ))}
                    </div>

                    {/* Ref */}
                    <div style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace', letterSpacing: 0.5 }}>
                        #{ticket.qrCodeString?.substring(0, 20).toUpperCase()}
                    </div>
                </div>

                {/* Dashed tear line */}
                <div style={{
                    width: 1,
                    background: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 6px, transparent 6px, transparent 12px)',
                    flexShrink: 0,
                    margin: '12px 0',
                    position: 'relative',
                }}>
                    {/* Notch circles */}
                    <div style={{ position: 'absolute', top: -10, left: -6, width: 12, height: 12, borderRadius: '50%', background: '#07070c' }} />
                    <div style={{ position: 'absolute', bottom: -10, left: -6, width: 12, height: 12, borderRadius: '50%', background: '#07070c' }} />
                </div>

                {/* ── RIGHT: QR Code ── */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 14px 14px 12px', gap: 8, flexShrink: 0, width: 120 }}>
                    {qrDataUrl ? (
                        <div style={{ background: 'white', borderRadius: 10, padding: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                            <img src={qrDataUrl} alt="QR Code" style={{ width: 88, height: 88, display: 'block' }} />
                        </div>
                    ) : (
                        <div style={{ width: 100, height: 100, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 20, height: 20, border: '2px solid rgba(226,55,68,0.5)', borderTopColor: '#e23744', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        </div>
                    )}
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px', textAlign: 'center', fontWeight: 700 }}>SCAN TO ENTER</div>
                </div>
            </div>

            {/* Download button */}
            <button
                onClick={handleDownload}
                disabled={downloading || !qrDataUrl}
                style={{
                    width: '100%',
                    background: downloaded
                        ? 'rgba(34,197,94,0.12)'
                        : 'rgba(226,55,68,0.08)',
                    border: `1px solid ${downloaded ? 'rgba(34,197,94,0.3)' : 'rgba(226,55,68,0.2)'}`,
                    borderTop: `1px solid rgba(255,255,255,0.05)`,
                    color: downloaded ? '#22c55e' : '#e23744',
                    padding: '11px 16px',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: downloading || !qrDataUrl ? 'not-allowed' : 'pointer',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.25s',
                    opacity: !qrDataUrl ? 0.5 : 1,
                }}
            >
                {downloading ? (
                    <><div style={{ width: 14, height: 14, border: '2px solid rgba(226,55,68,0.3)', borderTopColor: '#e23744', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Preparing...</>
                ) : downloaded ? (
                    <>✓ Saved to Gallery!</>
                ) : (
                    <>⬇ Download Ticket</>
                )}
            </button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function PaymentSuccessPage({ event, booking, tickets, userDetails, bookingDetails, onHome }) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const user = userDetails || booking?.User;
    const ticketList = tickets && tickets.length > 0 ? tickets : (
        bookingDetails?.seatIdentifiers?.map((sid, i) => ({
            id: i,
            qrCodeString: `placeholder-${i}`,
            seatIdentifier: sid,
            zone: bookingDetails?.zoneName || '—',
            price: bookingDetails?.totalPrice || 0
        }))
    ) || [];

    return (
        <div style={{ minHeight: '100vh', background: '#07070c', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{
                padding: isMobile ? '28px 16px 24px' : '40px 24px 32px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(34,197,94,0.06) 0%, transparent 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                {/* Animated tick */}
                <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(34,197,94,0.12)',
                    border: '2px solid rgba(34,197,94,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: 28,
                    animation: 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 0 32px rgba(34,197,94,0.15)',
                }}>✓</div>

                <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: 'white', marginBottom: 6 }}>
                    Booking Confirmed!
                </div>
                <div style={{ fontSize: 13, color: 'rgba(34,197,94,0.8)', fontWeight: 600, marginBottom: booking?.id ? 8 : 0 }}>
                    {ticketList.length} ticket{ticketList.length !== 1 ? 's' : ''} ready · Show QR at venue entrance
                </div>
                {booking?.id && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginTop: 4 }}>
                        Booking #{booking.id}
                    </div>
                )}
            </div>

            {/* Ticket(s) */}
            <div style={{ padding: isMobile ? '20px 12px' : '28px 20px', maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ticketList.map((ticket, i) => (
                    <TicketCard
                        key={ticket.id ?? i}
                        ticket={ticket}
                        event={event}
                        user={user}
                        bookingId={booking?.id}
                        index={i}
                        total={ticketList.length}
                    />
                ))}

                {/* Info note */}
                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.35)',
                    lineHeight: 1.6,
                    textAlign: 'center',
                }}>
                    📱 Download your tickets to your gallery or take a screenshot. Present the QR code at the entrance.
                </div>

                <button
                    onClick={onHome}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.5)',
                        padding: '13px',
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: 4,
                    }}
                >
                    ← Explore More Events
                </button>
            </div>

            <style>{`
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
