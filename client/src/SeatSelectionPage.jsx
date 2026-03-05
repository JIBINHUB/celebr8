import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
    ChevronLeft, Calendar, MapPin, ArrowRight
} from 'lucide-react';

const MemoizedSeat = memo(({ seat, isSelected, isHovered, size, onHover, onLeave, onClick }) => {
    return (
        <React.Fragment>
            {seat.label && (
                <div style={{
                    position: 'absolute', left: seat.x + (seat.label.isLeft ? -22 : size + 6), top: seat.y + 1,
                    fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace',
                    display: 'flex', alignItems: 'center', height: size
                }}>{seat.label.text}</div>
            )}
            <div
                onMouseEnter={!seat.isBooked ? onHover : undefined}
                onMouseLeave={onLeave}
                onClick={(e) => { e.stopPropagation(); onClick(seat); }}
                style={{
                    position: 'absolute', left: seat.x, top: seat.y,
                    width: size, height: size, borderRadius: '4px',
                    background: seat.isBooked ? 'rgba(255,255,255,0.06)' : isSelected ? seat.zone.color : isHovered ? `${seat.zone.color}99` : `${seat.zone.color}35`,
                    cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isSelected ? 'scale(1.25) translateY(-2px)' : isHovered ? 'scale(1.15)' : 'scale(1)',
                    boxShadow: isSelected ? `0 0 24px ${seat.zone.color}, 0 0 12px ${seat.zone.color}90, inset 0 0 8px rgba(255,255,255,0.8)` : 'none',
                    border: seat.isBooked ? '1px solid rgba(255,255,255,0.04)' : `1px solid ${isSelected ? '#ffffff' : `${seat.zone.color}60`}`,
                    zIndex: isSelected || isHovered ? 10 : 1,
                    animation: isSelected ? 'pulse-glow 2s infinite' : `seat-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both`,
                    animationDelay: `${(seat.y / 20) * 0.05 + (Math.abs(seat.x) / 50) * 0.02}s`
                }}
            >
                {/* Tooltip */}
                {isHovered && !seat.isBooked && (
                    <div style={{
                        position: 'absolute', bottom: size + 10, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(8,8,14,0.95)', backdropFilter: 'blur(12px)',
                        border: `1px solid ${seat.zone.color}60`, padding: '5px 10px', borderRadius: 8,
                        color: 'white', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', pointerEvents: 'none',
                        boxShadow: `0 6px 16px rgba(0,0,0,0.5)`, zIndex: 100, letterSpacing: 0.3
                    }}>
                        {seat.displayIdentifier} · £{seat.zone.price}
                        <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 7, height: 7, background: 'rgba(8,8,14,0.95)', borderRight: `1px solid ${seat.zone.color}60`, borderBottom: `1px solid ${seat.zone.color}60` }} />
                    </div>
                )}
                {/* Chair legs */}
                <div style={{ position: 'absolute', bottom: -2, left: 0, width: 2, height: 5, background: seat.isBooked ? 'rgba(255,255,255,0.05)' : `${seat.zone.color}80`, borderRadius: 1 }} />
                <div style={{ position: 'absolute', bottom: -2, right: 0, width: 2, height: 5, background: seat.isBooked ? 'rgba(255,255,255,0.05)' : `${seat.zone.color}80`, borderRadius: 1 }} />
            </div>
        </React.Fragment>
    );
});

// --- SEAT SELECTION PAGE (PREMIUM REDESIGN) ---
function SeatSelectionPage({ event, onBack, onProceed }) {
    const isMobile = useIsMobile();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [hoveredSeat, setHoveredSeat] = useState(null);
    const [activeZoneFilter, setActiveZoneFilter] = useState(null);
    const [zoom, setZoom] = useState(isMobile ? 0.55 : 0.85);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showSheet, setShowSheet] = useState(false);
    const mapRef = useRef(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const lastPinchDist = useRef(null);

    const MAX_SEATS = 10;
    const SEAT_SIZE = isMobile ? 20 : 14;
    const SEAT_GAP_X = isMobile ? 22 : 18;
    const SEAT_GAP_Y = isMobile ? 24 : 20;

    const VENUE_LAYOUTS = {
        London: {
            width: 900, height: 700, zones: [
                {
                    id: 'vvip', name: 'VVIP', price: 70, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', desc: 'Front row, premium lounge access', icon: '👑', blocks: [
                        { rStart: 0, rCount: 3, cStart: 0, cCount: 12, xOffset: -256, yOffset: 150, rowLabels: ['A', 'B', 'C'] },
                        { rStart: 0, rCount: 3, cStart: 12, cCount: 12, xOffset: 40, yOffset: 150, rowLabels: ['A', 'B', 'C'] }
                    ]
                },
                {
                    id: 'vip', name: 'VIP', price: 50, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', desc: 'Excellent elevated view', icon: '⭐', blocks: [
                        { rStart: 3, rCount: 6, cStart: 0, cCount: 16, xOffset: -328, yOffset: 260, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] },
                        { rStart: 3, rCount: 6, cStart: 16, cCount: 16, xOffset: 40, yOffset: 260, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] }
                    ]
                },
                {
                    id: 'diamond', name: 'Diamond', price: 40, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', desc: 'Great central viewing', icon: '💎', blocks: [
                        { rStart: 9, rCount: 7, cStart: 0, cCount: 20, xOffset: -400, yOffset: 420, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] },
                        { rStart: 9, rCount: 7, cStart: 20, cCount: 20, xOffset: 40, yOffset: 420, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] }
                    ]
                },
                {
                    id: 'platinum', name: 'Platinum', price: 30, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)', desc: 'Amazing value seating', icon: '🎫', blocks: [
                        { rStart: 16, rCount: 4, cStart: 0, cCount: 20, xOffset: -400, yOffset: 600, rowLabels: ['Q', 'R', 'S', 'T'] },
                        { rStart: 16, rCount: 4, cStart: 20, cCount: 20, xOffset: 40, yOffset: 600, rowLabels: ['Q', 'R', 'S', 'T'] }
                    ]
                }
            ]
        },
        Leicester: {
            width: 900, height: 750, zones: [
                {
                    id: 'vvip', name: 'VVIP', price: 70, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', desc: 'Front row, premium lounge access', icon: '👑', blocks: [
                        { rStart: 0, rCount: 2, cStart: 0, cCount: 12, xOffset: -256, yOffset: 150, rowLabels: ['A', 'B'] },
                        { rStart: 0, rCount: 2, cStart: 12, cCount: 12, xOffset: 40, yOffset: 150, rowLabels: ['A', 'B'] }
                    ]
                },
                {
                    id: 'vip', name: 'VIP', price: 50, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', desc: 'Excellent elevated view', icon: '⭐', blocks: [
                        { rStart: 2, rCount: 6, cStart: 0, cCount: 16, xOffset: -328, yOffset: 230, rowLabels: ['C', 'D', 'E', 'F', 'G', 'H'] },
                        { rStart: 2, rCount: 6, cStart: 16, cCount: 16, xOffset: 40, yOffset: 230, rowLabels: ['C', 'D', 'E', 'F', 'G', 'H'] }
                    ]
                },
                {
                    id: 'diamond', name: 'Diamond', price: 40, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', desc: 'Great central viewing', icon: '💎', blocks: [
                        { rStart: 8, rCount: 10, cStart: 0, cCount: 20, xOffset: -400, yOffset: 390, rowLabels: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] },
                        { rStart: 8, rCount: 10, cStart: 20, cCount: 20, xOffset: 40, yOffset: 390, rowLabels: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] }
                    ]
                },
                {
                    id: 'platinum', name: 'Platinum', price: 30, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)', desc: 'Amazing value seating', icon: '🎫', blocks: [
                        { rStart: 18, rCount: 4, cStart: 0, cCount: 20, xOffset: -400, yOffset: 630, rowLabels: ['S', 'T', 'U', 'V'] },
                        { rStart: 18, rCount: 4, cStart: 20, cCount: 20, xOffset: 40, yOffset: 630, rowLabels: ['S', 'T', 'U', 'V'] }
                    ]
                }
            ]
        },
        Manchester: {
            width: 900, height: 700, zones: [
                {
                    id: 'vvip', name: 'VVIP', price: 70, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', desc: 'Front row, premium lounge access', icon: '👑', blocks: [
                        { rStart: 0, rCount: 3, cStart: 0, cCount: 12, xOffset: -256, yOffset: 150, rowLabels: ['A', 'B', 'C'] },
                        { rStart: 0, rCount: 3, cStart: 12, cCount: 12, xOffset: 40, yOffset: 150, rowLabels: ['A', 'B', 'C'] }
                    ]
                },
                {
                    id: 'vip', name: 'VIP', price: 50, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', desc: 'Excellent elevated view', icon: '⭐', blocks: [
                        { rStart: 3, rCount: 6, cStart: 0, cCount: 16, xOffset: -328, yOffset: 250, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] },
                        { rStart: 3, rCount: 6, cStart: 16, cCount: 16, xOffset: 40, yOffset: 250, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] }
                    ]
                },
                {
                    id: 'diamond', name: 'Diamond', price: 40, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', desc: 'Great central viewing', icon: '💎', blocks: [
                        { rStart: 9, rCount: 7, cStart: 0, cCount: 20, xOffset: -400, yOffset: 410, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] },
                        { rStart: 9, rCount: 7, cStart: 20, cCount: 20, xOffset: 40, yOffset: 410, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] }
                    ]
                },
                {
                    id: 'platinum', name: 'Platinum', price: 30, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)', desc: 'Amazing value seating', icon: '🎫', blocks: [
                        { rStart: 16, rCount: 4, cStart: 0, cCount: 20, xOffset: -400, yOffset: 590, rowLabels: ['Q', 'R', 'S', 'T'] },
                        { rStart: 16, rCount: 4, cStart: 20, cCount: 20, xOffset: 40, yOffset: 590, rowLabels: ['Q', 'R', 'S', 'T'] }
                    ]
                }
            ]
        },
        default: {
            width: 900, height: 500, zones: [
                {
                    id: 'standard', name: 'Standard', price: parseInt(event.price.replace(/[^0-9]/g, '')) || 50, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', desc: 'General Admission', icon: '🎫', blocks: [
                        { rStart: 0, rCount: 10, cStart: 0, cCount: 20, xOffset: -180, yOffset: 200, rowLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] }
                    ]
                }
            ]
        }
    };

    const layout = VENUE_LAYOUTS[event.city] || VENUE_LAYOUTS.default;
    const zones = layout.zones;

    const generateSeats = useCallback(() => {
        const seats = [];
        zones.forEach(zone => {
            zone.blocks.forEach(block => {
                for (let r = 0; r < block.rCount; r++) {
                    for (let c = 0; c < block.cCount; c++) {
                        const id = `${zone.id}-${block.rStart + r}-${block.cStart + c}`;
                        const isBooked = Math.random() > 0.85;
                        const x = block.xOffset + c * SEAT_GAP_X;
                        const y = block.yOffset + r * SEAT_GAP_Y;
                        let label = null;
                        if (c === 0 && block.xOffset < 0) label = { text: block.rowLabels[r], isLeft: true };
                        else if (c === block.cCount - 1 && block.xOffset > 0) label = { text: block.rowLabels[r], isLeft: false };
                        const prefix = zone.id.toUpperCase();
                        const rowL = block.rowLabels[r] || String.fromCharCode(65 + r);
                        const colIdx = block.cStart + c + 1;
                        const dbIdentifier = `${prefix} - ${rowL}${colIdx}`;
                        const displayIdentifier = `${prefix} · ${rowL}${colIdx}`;
                        seats.push({ id, identifier: dbIdentifier, displayIdentifier, zone, row: block.rStart + r, col: block.cStart + c, x, y, label, isBooked });
                    }
                }
            });
        });
        return seats;
    }, [event.city, zones]);

    const [seats] = useState(generateSeats);

    const toggleSeat = useCallback((seat) => {
        if (seat.isBooked) return;
        setSelectedSeats(prev => {
            if (prev.find(s => s.id === seat.id)) return prev.filter(s => s.id !== seat.id);
            if (prev.length >= MAX_SEATS) return prev;
            return [...prev, seat];
        });
        setShowSheet(true);
    }, []);

    const totalPrice = selectedSeats.reduce((sum, s) => sum + s.zone.price, 0);

    // Touch: pinch-to-zoom
    const handleTouchMove = useCallback((e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (lastPinchDist.current !== null) {
                const delta = dist - lastPinchDist.current;
                setZoom(z => Math.min(Math.max(0.4, z + delta * 0.003), 2.5));
            }
            lastPinchDist.current = dist;
        } else if (isDragging.current && e.touches.length === 1) {
            setPan({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
        }
    }, [pan]);

    const handleTouchEnd = useCallback(() => {
        lastPinchDist.current = null;
        isDragging.current = false;
    }, []);

    const handleTouchStart = useCallback((e) => {
        if (e.touches.length === 1) {
            isDragging.current = true;
            dragStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
        }
    }, [pan]);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        setZoom(z => Math.min(Math.max(0.4, z - e.deltaY * 0.001), 2.5));
    }, []);

    const handlePointerDown = useCallback((e) => {
        if (e.pointerType === 'touch') return;
        isDragging.current = true;
        dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }, [pan]);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging.current || e.pointerType === 'touch') return;
        setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    }, []);

    const handlePointerUp = useCallback(() => { isDragging.current = false; }, []);

    const resetView = useCallback(() => {
        setZoom(isMobile ? 0.55 : 0.85);
        setPan({ x: 0, y: 0 });
    }, [isMobile]);

    const handleProceed = () => {
        if (selectedSeats.length === 0) return;
        onProceed({
            ticketCount: selectedSeats.length,
            zoneId: selectedSeats[0].zone.id,
            zoneName: [...new Set(selectedSeats.map(s => s.zone.name))].join(', '),
            seatIdentifiers: selectedSeats.map(s => s.identifier),
            totalPrice
        });
    };

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') setSelectedSeats([]);
            if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.15, 2.5));
            if (e.key === '-') setZoom(z => Math.max(z - 0.15, 0.4));
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const filteredSeats = activeZoneFilter ? seats.filter(s => s.zone.id === activeZoneFilter) : seats;
    const dimmedSeats = activeZoneFilter ? seats.filter(s => s.zone.id !== activeZoneFilter) : [];

    return (
        <div className="seat-selection-page animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#07070c', overflow: 'hidden', position: 'relative' }}>

            {/* Ambient background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${event.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(80px) brightness(0.12) saturate(1.4)', transform: 'scale(1.2)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{
                height: isMobile ? 56 : 72, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isMobile ? '0 12px' : '0 28px', zIndex: 50, position: 'relative',
                background: 'rgba(7,7,12,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 20 }}>
                    <button onClick={onBack} style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white', cursor: 'pointer', borderRadius: 20, padding: '0 14px', height: 36,
                        display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
                    }}>
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: isMobile ? 14 : 17, color: 'white', maxWidth: isMobile ? 180 : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={10} /> {event.date} {!isMobile && <><span style={{ margin: '0 4px', opacity: 0.3 }}>·</span><MapPin size={10} /> {event.venue}, {event.city}</>}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {selectedSeats.length > 0 && (
                        <div style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
                            {selectedSeats.length} selected
                        </div>
                    )}
                </div>
            </div>

            {/* Zone Quick Filters */}
            <div style={{
                display: 'flex', gap: 6, padding: isMobile ? '8px 12px' : '10px 28px', zIndex: 40,
                overflowX: 'auto', position: 'relative', background: 'rgba(7,7,12,0.5)', backdropFilter: 'blur(12px)'
            }}>
                <button onClick={() => setActiveZoneFilter(null)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                    background: !activeZoneFilter ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${!activeZoneFilter ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    color: !activeZoneFilter ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s'
                }}>All Zones</button>
                {zones.map(z => (
                    <button key={z.id} onClick={() => setActiveZoneFilter(activeZoneFilter === z.id ? null : z.id)} style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                        background: activeZoneFilter === z.id ? `${z.color}20` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${activeZoneFilter === z.id ? z.color : 'rgba(255,255,255,0.08)'}`,
                        color: activeZoneFilter === z.id ? z.color : 'rgba(255,255,255,0.5)', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 5
                    }}>
                        <span>{z.icon}</span> {z.name} <span style={{ opacity: 0.6 }}>£{z.price}</span>
                    </button>
                ))}
            </div>

            {/* Main content area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

                {/* Desktop Sidebar */}
                {!isMobile && (
                    <div style={{
                        width: 280, background: 'rgba(10,10,18,0.6)', backdropFilter: 'blur(16px)',
                        borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 10,
                        overflowY: 'auto'
                    }}>
                        <div style={{ padding: '16px 18px 8px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Seating Zones</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {zones.map(zone => {
                                    const zoneSeats = seats.filter(s => s.zone.id === zone.id);
                                    const available = zoneSeats.filter(s => !s.isBooked).length;
                                    const selected = selectedSeats.filter(s => s.zone.id === zone.id).length;
                                    return (
                                        <div key={zone.id} onClick={() => setActiveZoneFilter(activeZoneFilter === zone.id ? null : zone.id)} style={{
                                            padding: '12px 14px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.25s',
                                            background: activeZoneFilter === zone.id ? `${zone.color}15` : 'rgba(255,255,255,0.02)',
                                            border: `1px solid ${activeZoneFilter === zone.id ? `${zone.color}40` : 'rgba(255,255,255,0.05)'}`,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: zone.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{zone.icon}</div>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{zone.name}</div>
                                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{zone.desc}</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: zone.color }}>£{zone.price}</div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{available} available</div>
                                                {selected > 0 && <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 10 }}>{selected} selected</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div style={{ padding: '12px 18px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Legend</div>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {[{ label: 'Available', bg: 'rgba(59,130,246,0.4)', border: '#3B82F6' }, { label: 'Selected', bg: '#3B82F6', border: '#3B82F6' }, { label: 'Sold', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.05)' }].map(l => (
                                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{l.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
                                Press +/- to zoom · Esc to deselect
                            </div>
                        </div>
                    </div>
                )}

                {/* Interactive Map */}
                <div ref={mapRef}
                    onWheel={handleWheel}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab', touchAction: 'none' }}
                >
                    {/* Zoom Controls */}
                    <div style={{ position: 'absolute', right: isMobile ? 12 : 20, top: isMobile ? 8 : 16, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20 }}>
                        <button onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(15,15,22,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 18, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                        <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(15,15,22,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 18, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
                        <button onClick={resetView} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(15,15,22,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>FIT</button>
                    </div>

                    {/* Map Canvas with Premium 3D Perspective */}
                    <div style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: '50% 50%',
                        transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        perspective: '1200px'
                    }}>
                        <div style={{ position: 'relative', width: 900, height: 900, transformStyle: 'preserve-3d', transform: 'rotateX(35deg) scale(0.9)', transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>

                            {/* Stage with physical tilt effect */}
                            <div style={{
                                position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%) translateZ(20px)', width: 420, height: 80,
                                borderRadius: '50% 50% 0 0', background: 'linear-gradient(to top, rgba(226,55,68,0.15), rgba(226,55,68,0.02))',
                                border: '1.5px solid rgba(226,55,68,0.4)', borderBottom: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 -20px 60px rgba(226,55,68,0.15), inset 0 -10px 40px rgba(226,55,68,0.1)'
                            }}>
                                <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 8, color: 'rgba(226,55,68,0.8)', marginTop: 24, textTransform: 'uppercase', textShadow: '0 0 20px rgba(226,55,68,0.5)' }}>Main Stage</span>
                            </div>
                            {/* Stage scan line */}
                            <div style={{ position: 'absolute', top: 135, left: '50%', transform: 'translateX(-50%)', width: 300, height: 1, background: 'linear-gradient(90deg, transparent, rgba(226,55,68,0.3), transparent)', animation: 'shimmer 3s infinite' }} />

                            {/* Seat grid */}
                            <div style={{ position: 'absolute', top: 180, left: '50%', transform: 'translateX(-50%)', width: layout.width, height: layout.height }}>
                                {/* Dimmed seats (when zone filter active) */}
                                {dimmedSeats.map(seat => (
                                    <div key={seat.id} style={{
                                        position: 'absolute', left: layout.width / 2 + seat.x, top: seat.y,
                                        width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: '3px 3px 2px 2px',
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.03)',
                                        transition: 'all 0.3s', opacity: 0.3
                                    }} />
                                ))}

                                {/* Active seats */}
                                {filteredSeats.map(seat => (
                                    <MemoizedSeat
                                        key={seat.id}
                                        seat={{ ...seat, x: layout.width / 2 + seat.x }}
                                        isSelected={selectedSeats.some(s => s.id === seat.id)}
                                        isHovered={hoveredSeat === seat.id}
                                        size={SEAT_SIZE}
                                        onHover={() => !isMobile && setHoveredSeat(seat.id)}
                                        onLeave={() => !isMobile && setHoveredSeat(null)}
                                        onClick={toggleSeat}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Legend (compact) */}
            {isMobile && (
                <div style={{
                    position: 'absolute', top: 120, left: 10, zIndex: 30, padding: '8px 12px', borderRadius: 12,
                    background: 'rgba(8,8,14,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', flexDirection: 'column', gap: 5
                }}>
                    {zones.map(z => (
                        <div key={z.id} onClick={() => setActiveZoneFilter(activeZoneFilter === z.id ? null : z.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: activeZoneFilter && activeZoneFilter !== z.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: z.color }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: 'white' }}>{z.name}</span>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>£{z.price}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom Selection Sheet (Apple Wallet Liquid Glass style) */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
                transform: selectedSeats.length > 0 ? 'translateY(0)' : 'translateY(110%)',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: isMobile ? '0 12px 24px' : '0 24px 32px'
            }}>
                <div style={{
                    maxWidth: 800, margin: '0 auto',
                    background: 'rgba(20, 20, 30, 0.65)', backdropFilter: 'blur(30px) saturate(150%)', WebkitBackdropFilter: 'blur(30px) saturate(150%)',
                    border: `1px solid ${selectedSeats.length > 0 ? selectedSeats[0].zone.color + '40' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 24, padding: isMobile ? '16px' : '20px 24px',
                    boxShadow: `0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)`,
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: isMobile ? 16 : 24
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected</span>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>·</span>
                            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: selectedSeats[0]?.zone.color }}>{[...new Set(selectedSeats.map(s => s.zone.name))].join(', ')}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                            {selectedSeats.slice(0, 6).map(s => (
                                <span key={s.id} onClick={() => toggleSeat(s)} style={{
                                    padding: '4px 8px', borderRadius: 8, background: `${s.zone.color}20`, border: `1px solid ${s.zone.color}40`,
                                    fontSize: 10, fontWeight: 800, color: 'white', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.5,
                                    boxShadow: `0 4px 12px ${s.zone.color}20`
                                }}>{s.displayIdentifier}</span>
                            ))}
                            {selectedSeats.length > 6 && <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', alignSelf: 'center', marginLeft: 4 }}>+{selectedSeats.length - 6} more</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: isMobile ? 'rgba(0,0,0,0.2)' : 'transparent', padding: isMobile ? '12px' : 0, borderRadius: isMobile ? 16 : 0 }}>
                        <div style={{ textAlign: isMobile ? 'left' : 'right', flex: isMobile ? 1 : 'none' }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Total Price</div>
                            <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, color: 'white', letterSpacing: -1 }}>£{totalPrice}</div>
                        </div>
                        <button onClick={handleProceed} style={{
                            padding: isMobile ? '14px 28px' : '14px 32px', borderRadius: 16, fontSize: 15, fontWeight: 800,
                            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                            background: selectedSeats.length > 0 ? selectedSeats[0].zone.gradient : 'var(--accent)',
                            color: 'white', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap',
                            boxShadow: `0 8px 24px ${selectedSeats[0]?.zone.color || 'var(--accent)'}60, inset 0 2px 0 rgba(255,255,255,0.2)`,
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            Checkout <ArrowRight size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
