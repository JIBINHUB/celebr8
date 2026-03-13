import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CheckCircle, XCircle, Loader2, Camera, ShieldCheck, User, MapPin } from 'lucide-react';

const AdminScanner = ({ apiBaseUrl }) => {
    const [scanResult, setScanResult] = useState(null); // null, 'success', 'error', 'loading'
    const [ticketData, setTicketData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isScanning, setIsScanning] = useState(true);

    // Play audio feedback
    const playSound = (type) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            if (type === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
                gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            } else {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) { console.error("Audio block", e); }
    };

    const handleScan = async (devices) => {
        if (!devices || devices.length === 0 || !isScanning) return;
        const rawData = devices[0].rawValue;

        // Validate it's our ticket format
        if (!rawData.startsWith('celebr8-ticket:')) {
            return; // Ignore random QR codes
        }

        setIsScanning(false);
        setScanResult('loading');

        try {
            const response = await fetch(`${apiBaseUrl}/api/tickets/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCodeString: rawData }),
            });

            const data = await response.json();

            if (response.status === 200 && data.success) {
                setScanResult('success');
                setTicketData(data);
                playSound('success');
            } else if (response.status === 409) {
                setScanResult('error');
                setErrorMessage(`ALREADY SCANNED at ${new Date(data.scannedAt).toLocaleTimeString()}`);
                setTicketData(data); // Includes name/seat even if failed
                playSound('error');
            } else {
                setScanResult('error');
                setErrorMessage(data.message || 'Invalid Ticket');
                playSound('error');
            }
        } catch (err) {
            console.error(err);
            setScanResult('error');
            setErrorMessage('Network Error - Check Connection');
            playSound('error');
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setTicketData(null);
        setErrorMessage('');
        setTimeout(() => setIsScanning(true), 500); // slight delay to prevent instant re-scan
    };

    // Keyboard shortcut to reset
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                if (scanResult === 'success' || scanResult === 'error') {
                    e.preventDefault();
                    resetScanner();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [scanResult]);

    return (
        <div style={{ maxWidth: 500, margin: '0 auto', background: 'var(--bg-card)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <ShieldCheck color="var(--accent)" size={24} />
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Entry Scanner</h2>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Real-time verification</div>
                </div>
            </div>

            <div style={{ position: 'relative', background: '#000', minHeight: 400, display: 'flex', flexDirection: 'column' }}>

                {/* State: Camera Active */}
                {isScanning && (
                    <div style={{ position: 'relative', flex: 1 }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
                            <div style={{ width: 250, height: 250, border: '2px solid rgba(255,255,255,0.2)', borderRadius: 20, position: 'relative' }}>
                                {/* Aiming Reticle corners */}
                                <div style={{ position: 'absolute', top: -2, left: -2, width: 40, height: 40, borderTop: '4px solid var(--accent)', borderLeft: '4px solid var(--accent)', borderRadius: '20px 0 0 0' }} />
                                <div style={{ position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderTop: '4px solid var(--accent)', borderRight: '4px solid var(--accent)', borderRadius: '0 20px 0 0' }} />
                                <div style={{ position: 'absolute', bottom: -2, left: -2, width: 40, height: 40, borderBottom: '4px solid var(--accent)', borderLeft: '4px solid var(--accent)', borderRadius: '0 0 0 20px' }} />
                                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderBottom: '4px solid var(--accent)', borderRight: '4px solid var(--accent)', borderRadius: '0 0 20px 0' }} />
                            </div>
                        </div>

                        <Scanner
                            onScan={handleScan}
                            formats={['qr_code']}
                            components={{ audio: false, finder: false }}
                            styles={{ video: { objectFit: 'cover' }, container: { height: 400 } }}
                        />
                    </div>
                )}

                {/* State: Loading */}
                {scanResult === 'loading' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                        <Loader2 className="animate-spin" size={48} color="var(--accent)" style={{ marginBottom: 16 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>Verifying Ticket...</div>
                    </div>
                )}

                {/* State: Success */}
                {scanResult === 'success' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.95)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, padding: 24, animation: 'fadeIn 0.2s ease-out' }}>
                        <CheckCircle size={80} color="white" style={{ marginBottom: 20, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.4))' }} />
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-1px' }}>VALID TICKET</h1>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px 24px', borderRadius: 16, width: '100%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Guest Details</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><User size={20} />{ticketData?.customer}</div>

                            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />

                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Seats ({ticketData?.totalSeats || 1} total)</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <MapPin size={20} />
                                {ticketData?.allSeats ? ticketData.allSeats.join(', ') : ticketData?.seat}
                            </div>
                            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Zone: {ticketData?.zone}</div>
                        </div>
                    </div>
                )}

                {/* State: Error / Already Scanned */}
                {scanResult === 'error' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(220,38,38,0.95)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, padding: 24, animation: 'fadeIn 0.2s ease-out' }}>
                        <XCircle size={80} color="white" style={{ marginBottom: 20, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.4))' }} />
                        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 8, textAlign: 'center', lineHeight: 1.1 }}>{errorMessage}</h1>

                        {ticketData && ticketData.customer && (
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px 24px', borderRadius: 16, width: '100%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', marginTop: 16 }}>
                                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Guest: {ticketData.customer}</div>
                                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Seats: {ticketData.allSeats ? ticketData.allSeats.join(', ') : ticketData.seat}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Controls */}
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'center' }}>
                {scanResult ? (
                    <button
                        onClick={resetScanner}
                        style={{ width: '100%', padding: '16px', background: 'white', color: 'black', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                    >
                        <Camera size={20} /> Tap to Scan Next Ticket
                    </button>
                ) : (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Points camera at ticket to scan instantly</div>
                )}
            </div>
        </div>
    );
};

export default AdminScanner;
