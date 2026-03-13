const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Event, Booking, Ticket, SeatInventory, User, sequelize } = require('../models');

const OWNER_PASSWORD = process.env.OWNER_PASSWORD || '8080';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '3699';
const JWT_SECRET = process.env.JWT_SECRET || 'celebr8-owner-secret-2026';

// Auth middleware — validates JWT (survives Cloud Run restarts/scaling)
const authMiddleware = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ message: 'No authorization header' });
    const token = auth.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.ownerRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// POST /login — Owner Login (returns JWT that survives container restarts)
router.post('/login', async (req, res) => {
    const { password } = req.body;
    if (password !== OWNER_PASSWORD) {
        return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ role: 'owner' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
});

// POST /admin-login — Admin Control Pin
router.post('/admin-login', authMiddleware, async (req, res) => {
    const { pin } = req.body;
    if (pin !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid admin PIN' });
    }
    res.json({ success: true });
});

// GET /stats — Dashboard Statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const totalBookings = await Booking.count({ where: { status: 'confirmed' } });
        const totalRevenue = await Booking.sum('totalAmount', { where: { status: 'confirmed' } }) || 0;
        const totalTickets = await Ticket.count();
        const usedTickets = await Ticket.count({ where: { status: 'used' } });
        const events = await Event.findAll();

        // Per-event stats
        const eventStats = [];
        for (const event of events) {
            const totalSeats = await SeatInventory.count({ where: { eventId: event.id } });
            const bookedSeats = await SeatInventory.count({ where: { eventId: event.id, status: 'booked' } });
            const holdingSeats = await SeatInventory.count({ where: { eventId: event.id, status: 'holding' } });
            eventStats.push({
                id: event.id,
                title: event.title,
                totalSeats,
                bookedSeats,
                holdingSeats,
                availableSeats: totalSeats - bookedSeats - holdingSeats,
                fillRate: totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0
            });
        }

        res.json({
            totalBookings,
            totalRevenue,
            revenue: totalRevenue,
            totalTickets,
            usedTickets,
            checkedIn: usedTickets,
            eventStats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /bookings — All Confirmed Bookings (normalized for frontend)
router.get('/bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { status: 'confirmed' },
            include: [
                { model: User },
                { model: Event, attributes: ['id', 'title', 'city', 'venue', 'subtitle'] },
                {
                    model: Ticket,
                    attributes: ['id', 'qrCodeString', 'status', 'seatId'],
                    include: [
                        { model: SeatInventory, attributes: ['id', 'identifier', 'zone', 'price'] }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(req.query.limit) || 500
        });

        // Normalize into the flat shape the frontend expects
        const normalized = bookings.map(b => ({
            id: b.id,
            eventId: b.eventId,
            customerName: b.User?.name || '—',
            customerEmail: b.User?.email || '—',
            customerWhatsapp: b.User?.whatsapp || '—',
            totalAmount: b.totalAmount,
            status: b.status,
            eventTitle: b.Event?.title || '',
            eventCity: b.Event?.city || '',
            createdAt: b.createdAt,
            tickets: (b.Tickets || []).map(t => ({
                ticketId: t.id,
                qrCodeString: t.qrCodeString,
                seatIdentifier: t.SeatInventory?.identifier || '—',
                zone: t.SeatInventory?.zone || '—',
                price: t.SeatInventory?.price || 0,
                checkedIn: t.status === 'used'
            })),
            // Fallback seats from tickets
            seats: (b.Tickets || []).map(t => ({
                identifier: t.SeatInventory?.identifier || '—',
                zone: t.SeatInventory?.zone || '—',
                price: t.SeatInventory?.price || 0
            }))
        }));

        res.json(normalized);
    } catch (err) {
        console.error('OWNER BOOKINGS ERROR:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET /events — All Events (with seat counts for dashboard)
router.get('/events', authMiddleware, async (req, res) => {
    try {
        const events = await Event.findAll();
        const enriched = [];
        for (const event of events) {
            const totalSeats = await SeatInventory.count({ where: { eventId: event.id } });
            const bookedSeats = await SeatInventory.count({ where: { eventId: event.id, status: 'booked' } });
            const holdingSeats = await SeatInventory.count({ where: { eventId: event.id, status: 'holding' } });
            enriched.push({
                ...event.toJSON(),
                totalSeats,
                bookedSeats,
                holdingSeats,
                availableSeats: totalSeats - bookedSeats - holdingSeats,
                fillRate: totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : 0
            });
        }
        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /scan — QR Code Check-In (returns ALL seats from the same booking)
router.post('/scan', authMiddleware, async (req, res) => {
    const { qrData } = req.body;
    try {
        const ticket = await Ticket.findOne({
            where: { qrCodeString: qrData },
            include: [
                { model: SeatInventory, include: [Event] },
                { model: Booking, include: [User] }
            ]
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Invalid QR Code. Ticket not found.' });
        }

        if (ticket.status === 'used') {
            // Even for already-scanned, return ALL seats from this booking
            const siblingTickets = await Ticket.findAll({
                where: { bookingId: ticket.bookingId },
                include: [{ model: SeatInventory }]
            });
            return res.status(409).json({
                message: 'This ticket has already been checked in.',
                ticket: {
                    seat: ticket.SeatInventory?.identifier,
                    allSeats: siblingTickets.map(t => t.SeatInventory?.identifier).filter(Boolean),
                    event: ticket.SeatInventory?.Event?.title,
                    guest: ticket.Booking?.User?.name,
                    zone: ticket.SeatInventory?.zone,
                    totalSeats: siblingTickets.length
                }
            });
        }

        await ticket.update({ status: 'used', scannedAt: new Date() });

        // Fetch ALL sibling tickets for same booking to show all seats
        const siblingTickets = await Ticket.findAll({
            where: { bookingId: ticket.bookingId },
            include: [{ model: SeatInventory }]
        });

        res.json({
            message: 'Check-In Successful!',
            ticket: {
                seat: ticket.SeatInventory?.identifier,
                allSeats: siblingTickets.map(t => t.SeatInventory?.identifier).filter(Boolean),
                event: ticket.SeatInventory?.Event?.title,
                venue: ticket.SeatInventory?.Event?.venue,
                customer: ticket.Booking?.User?.name || 'Guest',
                email: ticket.Booking?.User?.email || '',
                whatsapp: ticket.Booking?.User?.whatsapp || '',
                paymentStatus: ticket.Booking?.status === 'confirmed' ? 'Paid' : 'Pending',
                zone: ticket.SeatInventory?.zone,
                totalSeats: siblingTickets.length
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /admin-login check above

// POST /reset-db — Admin: Reset All Locks (only pending/holding — preserves confirmed bookings)
router.post('/reset-db', authMiddleware, async (req, res) => {
    const { pin } = req.body;
    if (pin !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Invalid admin PIN' });

    try {
        const [unlockedCount] = await SeatInventory.update(
            { status: 'available', lockedAt: null, bookingId: null },
            { where: { status: 'holding' } }
        );
        const pendingBookings = await Booking.update(
            { status: 'cancelled' },
            { where: { status: 'pending' } }
        );
        res.json({
            message: `Reset complete. Unlocked ${unlockedCount} held seats, cancelled ${pendingBookings[0]} pending bookings. Confirmed (paid) bookings are preserved.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /clear-all-bookings — Admin: DELETE ALL bookings, tickets and reset all seats (nuclear option)
router.post('/clear-all-bookings', authMiddleware, async (req, res) => {
    const { pin } = req.body;
    if (pin !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Invalid admin PIN' });

    try {
        // Delete all tickets first (foreign key child)
        const deletedTickets = await Ticket.destroy({ where: {}, truncate: false });
        // Delete all bookings
        const deletedBookings = await Booking.destroy({ where: {}, truncate: false });
        // Reset ALL seat statuses back to available
        const [resetSeats] = await SeatInventory.update(
            { status: 'available', lockedAt: null, bookingId: null },
            { where: {} }
        );
        res.json({
            success: true,
            message: `✅ Cleared ${deletedTickets} tickets, ${deletedBookings} bookings, reset ${resetSeats} seats.`
        });
    } catch (err) {
        console.error('Clear all bookings error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /reseed — Admin: Full DB reseed (recreate all events and seats)
router.post('/reseed', authMiddleware, async (req, res) => {
    const { pin } = req.body;
    if (pin !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Invalid admin PIN' });

    try {
        // Same VENUE_LAYOUTS as seed.js / SeatSelectionPage.jsx
        const VENUE_LAYOUTS = {
            Leicester: {
                zones: [
                    { id: 'vvip', name: 'VVIP', price: 70, blocks: [
                        { rCount: 2, cStart: 0, cCount: 12, rowLabels: ['A', 'B'] },
                        { rCount: 2, cStart: 12, cCount: 12, rowLabels: ['A', 'B'] }
                    ]},
                    { id: 'vip', name: 'VIP', price: 50, blocks: [
                        { rCount: 6, cStart: 0, cCount: 16, rowLabels: ['C', 'D', 'E', 'F', 'G', 'H'] },
                        { rCount: 6, cStart: 16, cCount: 16, rowLabels: ['C', 'D', 'E', 'F', 'G', 'H'] }
                    ]},
                    { id: 'diamond', name: 'Diamond', price: 40, blocks: [
                        { rCount: 10, cStart: 0, cCount: 20, rowLabels: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] },
                        { rCount: 10, cStart: 20, cCount: 20, rowLabels: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] }
                    ]},
                    { id: 'platinum', name: 'Platinum', price: 30, blocks: [
                        { rCount: 4, cStart: 0, cCount: 20, rowLabels: ['S', 'T', 'U', 'V'] },
                        { rCount: 4, cStart: 20, cCount: 20, rowLabels: ['S', 'T', 'U', 'V'] }
                    ]}
                ]
            },
            London: {
                zones: [
                    { id: 'vvip', name: 'VVIP', price: 70, blocks: [
                        { rCount: 3, cStart: 0, cCount: 12, rowLabels: ['A', 'B', 'C'] },
                        { rCount: 3, cStart: 12, cCount: 12, rowLabels: ['A', 'B', 'C'] }
                    ]},
                    { id: 'vip', name: 'VIP', price: 50, blocks: [
                        { rCount: 6, cStart: 0, cCount: 16, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] },
                        { rCount: 6, cStart: 16, cCount: 16, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] }
                    ]},
                    { id: 'diamond', name: 'Diamond', price: 40, blocks: [
                        { rCount: 7, cStart: 0, cCount: 20, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] },
                        { rCount: 7, cStart: 20, cCount: 20, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] }
                    ]},
                    { id: 'platinum', name: 'Platinum', price: 30, blocks: [
                        { rCount: 4, cStart: 0, cCount: 20, rowLabels: ['Q', 'R', 'S', 'T'] },
                        { rCount: 4, cStart: 20, cCount: 20, rowLabels: ['Q', 'R', 'S', 'T'] }
                    ]}
                ]
            },
            Manchester: {
                zones: [
                    { id: 'vvip', name: 'VVIP', price: 70, blocks: [
                        { rCount: 1, cStart: 0, cCount: 9, rowLabels: ['A'] },
                        { rCount: 1, cStart: 9, cCount: 9, rowLabels: ['A'] },
                        { rCount: 1, cStart: 18, cCount: 9, rowLabels: ['A'] },
                        { rCount: 1, cStart: 27, cCount: 9, rowLabels: ['A'] }
                    ]},
                    { id: 'vip', name: 'VIP', price: 50, blocks: [
                        { rCount: 5, cStart: 0, cCount: 9, rowLabels: ['B', 'C', 'D', 'E', 'F'] },
                        { rCount: 5, cStart: 9, cCount: 9, rowLabels: ['B', 'C', 'D', 'E', 'F'] },
                        { rCount: 5, cStart: 18, cCount: 9, rowLabels: ['B', 'C', 'D', 'E', 'F'] },
                        { rCount: 5, cStart: 27, cCount: 9, rowLabels: ['B', 'C', 'D', 'E', 'F'] }
                    ]},
                    { id: 'diamond', name: 'Diamond', price: 40, blocks: [
                        { rCount: 7, cStart: 0, cCount: 9, rowLabels: ['G', 'H', 'I', 'J', 'K', 'L', 'M'] },
                        { rCount: 7, cStart: 9, cCount: 9, rowLabels: ['G', 'H', 'I', 'J', 'K', 'L', 'M'] },
                        { rCount: 7, cStart: 18, cCount: 9, rowLabels: ['G', 'H', 'I', 'J', 'K', 'L', 'M'] },
                        { rCount: 7, cStart: 27, cCount: 9, rowLabels: ['G', 'H', 'I', 'J', 'K', 'L', 'M'] }
                    ]},
                    { id: 'platinum', name: 'Platinum', price: 30, blocks: [
                        { rCount: 7, cStart: 0, cCount: 9, rowLabels: ['N', 'O', 'P', 'Q', 'R', 'S', 'T'] },
                        { rCount: 7, cStart: 9, cCount: 9, rowLabels: ['N', 'O', 'P', 'Q', 'R', 'S', 'T'] },
                        { rCount: 7, cStart: 18, cCount: 9, rowLabels: ['N', 'O', 'P', 'Q', 'R', 'S', 'T'] },
                        { rCount: 7, cStart: 27, cCount: 9, rowLabels: ['N', 'O', 'P', 'Q', 'R', 'S', 'T'] }
                    ]}
                ]
            },
            default: {
                zones: [
                    { id: 'standard', name: 'Standard', price: 30, blocks: [
                        { rCount: 10, cStart: 0, cCount: 20, rowLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] }
                    ]}
                ]
            }
        };

        const EVENTS = [
            { title: 'The Secret Letter', subtitle: 'Leicester', date: new Date('2026-04-24T19:00:00'), venue: 'Maher Centre', city: 'Leicester', category: 'Concert', description: 'An unforgettable live experience.', price: 'From £30', image: '/images/event1.jpg', mapType: 'standard' },
            { title: 'The Secret Letter', subtitle: 'London', date: new Date('2026-04-25T19:00:00'), venue: 'The Royal Regency', city: 'London', category: 'Concert', description: 'An unforgettable live experience.', price: 'From £30', image: '/images/event2.jpg', mapType: 'standard' },
            { title: 'The Secret Letter', subtitle: 'Manchester', date: new Date('2026-05-01T19:00:00'), venue: 'Forum Centre', city: 'Manchester', category: 'Concert', description: 'An unforgettable live experience.', price: 'From £30', image: '/images/event3.jpg', mapType: 'standard' },
            { title: 'The Secret Letter', subtitle: 'Edinburgh', date: new Date('2026-05-02T19:00:00'), venue: 'Assembly Rooms', city: 'Edinburgh', category: 'Concert', description: 'An unforgettable live experience.', price: 'From £30', image: '/images/event4.jpg', mapType: 'standard' }
        ];

        function genSeats(eventId, city) {
            const layout = VENUE_LAYOUTS[city] || VENUE_LAYOUTS.default;
            const seats = [];
            for (const zone of layout.zones) {
                for (const block of zone.blocks) {
                    for (let r = 0; r < block.rCount; r++) {
                        for (let c = 0; c < block.cCount; c++) {
                            const rowLabel = block.rowLabels[r] || String.fromCharCode(65 + r);
                            const colIdx = block.cStart + c + 1;
                            const identifier = `${zone.id.toUpperCase()} - ${rowLabel}${colIdx}`;
                            seats.push({ eventId, identifier, zone: zone.id.toUpperCase(), price: zone.price, status: 'available', lockedAt: null });
                        }
                    }
                }
            }
            return seats;
        }

        await sequelize.sync({ force: true });
        const results = [];
        for (const eventData of EVENTS) {
            const event = await Event.create(eventData);
            const seats = genSeats(event.id, event.city);
            await SeatInventory.bulkCreate(seats);
            results.push(`${event.city}: ${seats.length} seats`);
        }
        res.json({ message: 'Reseed complete!', results });
    } catch (err) {
        console.error('Reseed error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// =======================================================
// Owner Seat Hold/Release Management
// =======================================================

// POST /hold-seats — Owner holds specific seats (marks as 'booked' so they appear sold)
router.post('/hold-seats', authMiddleware, async (req, res) => {
    try {
        const { eventId, seatIdentifiers } = req.body;
        if (!eventId || !seatIdentifiers?.length) {
            return res.status(400).json({ success: false, message: 'eventId and seatIdentifiers required' });
        }

        const results = { held: [], alreadyBooked: [], notFound: [] };

        for (const identifier of seatIdentifiers) {
            const trimmed = identifier.trim();
            const seat = await SeatInventory.findOne({ where: { eventId, identifier: trimmed } });
            if (!seat) {
                results.notFound.push(trimmed);
            } else if (seat.status === 'booked') {
                results.alreadyBooked.push(trimmed);
            } else {
                await seat.update({ status: 'booked', lockedAt: new Date() });
                results.held.push(trimmed);
            }
        }

        res.json({ success: true, message: `Held ${results.held.length} seats`, results });
    } catch (err) {
        console.error('Hold seats error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /release-seats — Owner releases held seats back to 'available'
router.post('/release-seats', authMiddleware, async (req, res) => {
    try {
        const { eventId, seatIdentifiers } = req.body;
        if (!eventId || !seatIdentifiers?.length) {
            return res.status(400).json({ success: false, message: 'eventId and seatIdentifiers required' });
        }

        const results = { released: [], hasBooking: [], notFound: [] };

        for (const identifier of seatIdentifiers) {
            const trimmed = identifier.trim();
            const seat = await SeatInventory.findOne({ where: { eventId, identifier: trimmed } });
            if (!seat) {
                results.notFound.push(trimmed);
            } else if (seat.bookingId) {
                // This seat has a real booking — don't release it
                results.hasBooking.push(trimmed);
            } else {
                await seat.update({ status: 'available', lockedAt: null });
                results.released.push(trimmed);
            }
        }

        res.json({ success: true, message: `Released ${results.released.length} seats`, results });
    } catch (err) {
        console.error('Release seats error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /held-seats/:eventId — Get all owner-held seats (booked without a booking association)
router.get('/held-seats/:eventId', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;
        const heldSeats = await SeatInventory.findAll({
            where: { eventId, status: 'booked', bookingId: null },
            attributes: ['id', 'identifier', 'zone', 'price'],
            order: [['identifier', 'ASC']]
        });
        res.json(heldSeats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
