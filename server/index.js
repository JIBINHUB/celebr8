const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { sequelize, SeatInventory } = require('./models');
const cacheControl = require('./middleware/cacheControl');

// Import Routes
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const ownerRoutes = require('./routes/owner');
const ticketRoutes = require('./routes/tickets');

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cacheControl);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '5.0.0-cloud', uptime: process.uptime() });
});

// Apply Routes
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/tickets', ticketRoutes);

// ============================================================
// DATABASE SYNC & SERVER STARTUP
// ============================================================
const PORT = process.env.PORT || 5000;

async function startServer() {
    // 1. Start HTTP Server FIRST (Cloud Run health check passes immediately)
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 API Server listening on port ${PORT}`);
    });

    // 2. Sync DB schema in background (non-blocking)
    sequelize.authenticate()
        .then(() => {
            console.log('✅ Database connection verified (Google Cloud SQL).');
            return sequelize.sync({ alter: true });
        })
        .then(() => console.log('✅ Database schema synchronized.'))
        .catch(err => console.error('⚠️ DB sync error (non-fatal):', err.message));

    // ============================================================
    // BACKGROUND SEAT EXPIRY (every 15 seconds)
    // ============================================================
    const cleanupInterval = setInterval(async () => {
        try {
            if (bookingRoutes.cleanupExpiredSeats) {
                await bookingRoutes.cleanupExpiredSeats();
            }
        } catch (err) {
            console.error('Background cleanup error:', err.message);
        }
    }, 15 * 1000);

    console.log('⏰ Background seat expiry timer started (15s interval)');

    // ============================================================
    // GRACEFUL SHUTDOWN
    // ============================================================
    async function gracefulShutdown(signal) {
        console.log(`\n⚡ ${signal} received. Graceful shutdown...`);
        clearInterval(cleanupInterval);

        try {
            const [released] = await SeatInventory.update(
                { status: 'available', lockedAt: null, bookingId: null },
                { where: { status: 'holding' } }
            );
            if (released > 0) {
                console.log(`🔓 Released ${released} holding seats during shutdown`);
            }
        } catch (err) {
            console.error('Shutdown cleanup error:', err.message);
        }

        server.close(() => {
            console.log('🛑 Server closed.');
            sequelize.close().then(() => {
                console.log('🗄️ Database connections closed.');
                process.exit(0);
            });
        });

        setTimeout(() => {
            console.error('⚠️ Forced exit after 10s timeout');
            process.exit(1);
        }, 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// ============================================================
// CRASH PROTECTION
// ============================================================
process.on('uncaughtException', (err) => {
    console.error('🔴 UNCAUGHT EXCEPTION (server survived):', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
    console.error('🟡 UNHANDLED REJECTION (server survived):', reason);
});

startServer();
