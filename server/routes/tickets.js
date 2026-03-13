const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { jsPDF } = require('jspdf');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { Ticket, SeatInventory, Event, Booking, User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'celebr8-owner-secret-2026';

// Auth middleware for owner endpoints
const authMiddleware = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ message: 'No authorization header' });
    const token = auth.replace('Bearer ', '');
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Configure Nodemailer for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Fetch Public Ticket
router.get('/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            where: { id: req.params.id },
            include: [{ model: SeatInventory, include: [Event] }]
        });
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify Ticket by QR Code (Public Route for Customer Scans)
router.get('/verify/:code', async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            where: { qrCodeString: req.params.code },
            include: [
                { model: SeatInventory, include: [Event] },
                { model: Booking, include: [User] }
            ]
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Invalid or unknown ticket code.' });
        }

        // Fetch ALL sibling tickets for same booking
        const siblingTickets = await Ticket.findAll({
            where: { bookingId: ticket.bookingId },
            include: [{ model: SeatInventory }]
        });

        res.json({
            id: ticket.id,
            status: ticket.status,
            seat: ticket.SeatInventory?.identifier,
            allSeats: siblingTickets.map(t => t.SeatInventory?.identifier).filter(Boolean),
            zone: ticket.SeatInventory?.zone,
            event: ticket.SeatInventory?.Event?.title,
            venue: ticket.SeatInventory?.Event?.venue,
            date: ticket.SeatInventory?.Event?.date,
            customer: ticket.Booking?.User?.name || 'Guest',
            email: ticket.Booking?.User?.email,
            whatsapp: ticket.Booking?.User?.whatsapp,
            paymentStatus: ticket.Booking?.status === 'confirmed' ? 'Paid' : 'Pending',
            totalSeats: siblingTickets.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Secure Ticket Scanning (Admin Route — used by AdminScanner component)
router.post('/scan', async (req, res) => {
    try {
        const { qrCodeString } = req.body;

        // Remove 'celebr8-ticket:' prefix if the scanner passes raw data
        const cleanCode = qrCodeString.replace('celebr8-ticket:', '').trim();

        const ticket = await Ticket.findOne({
            where: { qrCodeString: cleanCode },
            include: [
                { model: SeatInventory, include: [Event] },
                { model: Booking, include: [User] }
            ]
        });

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Invalid or unknown ticket code.' });
        }

        const paymentStatus = ticket.Booking?.status === 'confirmed' ? 'Paid' : 'Pending';
        if (paymentStatus !== 'Paid') {
            return res.status(400).json({ success: false, message: 'Payment Not Completed.', status: 'unpaid' });
        }

        // Fetch ALL sibling tickets for same booking
        const siblingTickets = await Ticket.findAll({
            where: { bookingId: ticket.bookingId },
            include: [{ model: SeatInventory }]
        });

        if (ticket.scannedAt) {
            return res.status(409).json({
                success: false,
                message: 'ALREADY SCANNED',
                scannedAt: ticket.scannedAt,
                seat: ticket.SeatInventory?.identifier,
                allSeats: siblingTickets.map(t => t.SeatInventory?.identifier).filter(Boolean),
                customer: ticket.Booking?.User?.name,
                zone: ticket.SeatInventory?.zone,
                totalSeats: siblingTickets.length
            });
        }

        // Mark as scanned AND update status to 'used'
        ticket.scannedAt = new Date();
        ticket.status = 'used';
        await ticket.save();

        res.json({
            success: true,
            message: 'ACCESS GRANTED',
            id: ticket.id,
            seat: ticket.SeatInventory?.identifier,
            allSeats: siblingTickets.map(t => t.SeatInventory?.identifier).filter(Boolean),
            zone: ticket.SeatInventory?.zone,
            event: ticket.SeatInventory?.Event?.title,
            customer: ticket.Booking?.User?.name || 'Guest',
            scannedAt: ticket.scannedAt,
            totalSeats: siblingTickets.length
        });
    } catch (err) {
        console.error('Scan Error:', err);
        res.status(500).json({ success: false, message: 'Server error during scan.' });
    }
});

// =======================================================
// Nodemailer Premium Ticket Delivery
// =======================================================
router.post('/email-ticket', async (req, res) => {
    try {
        const {
            customerEmail,
            customerName,
            eventTitle,
            date,
            venue,
            city,
            gateOpens,
            showTime,
            zonesList,
            seatsList,
            seatsArray,
            ticketCount,
            totalPaid,
            bookingId,
            attachmentBase64,
            attachmentImageBase64
        } = req.body;

        if (!customerEmail) {
            return res.status(400).json({ success: false, message: 'Missing email' });
        }

        // Booking timestamp
        const bookedAt = new Date().toLocaleString('en-GB', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZoneName: 'short', timeZone: 'Europe/London'
        });

        // Seat pills HTML
        const seatPillsHtml = Array.isArray(seatsArray) && seatsArray.length > 0
            ? seatsArray.map(s =>
                `<span style="display:inline-block;background:#e23744;color:#fff;font-size:11px;font-weight:800;padding:5px 12px;border-radius:20px;margin:3px 3px;">${s}</span>`
              ).join('')
            : `<span style="color:#ffffff;">${seatsList || 'N/A'}</span>`;

        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Celebr8 Ticket</title>
</head>
<body style="margin:0;padding:0;background:#0a0a12;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;background:#0d0d18;border-radius:16px;overflow:hidden;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#e23744 0%,#c02030 100%);padding:44px 40px 32px;text-align:center;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.15);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:32px;">🎫</span>
      </div>
      <h1 style="color:#fff;margin:0 0 8px;font-size:28px;font-weight:900;letter-spacing:-0.5px;">Booking Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.82);margin:0;font-size:14px;">Your tickets are secured. Present QR code at the door.</p>
    </div>

    <!-- GREETING -->
    <div style="padding:32px 36px 16px;background:#111118;">
      <p style="color:#d4d4d4;font-size:15px;line-height:1.7;margin:0 0 12px;">
        Hi <strong style="color:#fff;">${customerName}</strong>,
      </p>
      <p style="color:#888;font-size:14px;line-height:1.8;margin:0 0 28px;">
        Thank you for booking with <strong style="color:#e23744;">Celebr8 Events</strong>.
        Your booking for <strong style="color:#fff;">${eventTitle}</strong> is confirmed and payment received.
        Your QR-coded PDF ticket is attached to this email.
      </p>
    </div>

    <!-- EVENT DETAILS CARD -->
    <div style="margin:0 24px 18px;background:#1a1a28;border:1px solid #252534;border-radius:12px;overflow:hidden;">
      <div style="padding:13px 20px;border-bottom:1px solid #252534;background:#17172a;">
        <span style="color:#e23744;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;">📍 Event Details</span>
      </div>
      <div style="padding:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:9px 0;width:38%;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Event</span>
            </td>
            <td style="padding:9px 0;vertical-align:top;">
              <strong style="color:#fff;font-size:14px;">${eventTitle}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Date</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <strong style="color:#fff;font-size:14px;">📅 ${date}</strong>
            </td>
          </tr>
          ${gateOpens ? `<tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Gate Opens</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <strong style="color:#10B981;font-size:14px;">🚪 ${gateOpens}</strong>
            </td>
          </tr>` : ''}
          ${showTime ? `<tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Show Starts</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <strong style="color:#10B981;font-size:14px;">🎤 ${showTime}</strong>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Venue</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <strong style="color:#fff;font-size:14px;">📍 ${venue}, ${city}</strong>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- BOOKING & SEATS CARD -->
    <div style="margin:0 24px 18px;background:#1a1a28;border:1px solid #252534;border-radius:12px;overflow:hidden;">
      <div style="padding:13px 20px;border-bottom:1px solid #252534;background:#17172a;">
        <span style="color:#e23744;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;">🎟️ Booking &amp; Seats</span>
      </div>
      <div style="padding:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:9px 0;width:38%;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Booked By</span>
            </td>
            <td style="padding:9px 0;vertical-align:top;">
              <strong style="color:#fff;font-size:14px;">👤 ${customerName}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Booked On</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <strong style="color:#fff;font-size:13px;">🕐 ${bookedAt}</strong>
            </td>
          </tr>
          ${bookingId ? `<tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Booking Ref</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <strong style="color:#fff;font-size:14px;">#${bookingId}</strong>
            </td>
          </tr>` : ''}
          <tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Number of Tickets</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <strong style="color:#fff;font-size:14px;">🎫 ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Zone / Level</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;vertical-align:top;">
              <strong style="color:#fff;font-size:14px;">${zonesList}</strong>
            </td>
          </tr>
        </table>

        <!-- Seat Pills -->
        <div style="margin-top:16px;border-top:1px solid #22222e;padding-top:16px;">
          <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:10px;">Your Seat Numbers</span>
          <div>${seatPillsHtml}</div>
        </div>
      </div>
    </div>

    <!-- PAYMENT CARD -->
    <div style="margin:0 24px 18px;background:#1a1a28;border:1px solid #252534;border-radius:12px;overflow:hidden;">
      <div style="padding:13px 20px;border-bottom:1px solid #252534;background:#17172a;">
        <span style="color:#e23744;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;">💳 Payment Summary</span>
      </div>
      <div style="padding:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:9px 0;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Payment Status</span>
            </td>
            <td style="padding:9px 0;text-align:right;">
              <span style="background:#10B981;color:#fff;font-size:11px;font-weight:800;padding:4px 14px;border-radius:20px;">✅ PAID</span>
            </td>
          </tr>
          <tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Method</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;text-align:right;">
              <strong style="color:#fff;font-size:13px;">💳 Card (Stripe)</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:9px 0;border-top:1px solid #22222e;">
              <span style="color:#555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Total Charged</span>
            </td>
            <td style="padding:9px 0;border-top:1px solid #22222e;text-align:right;">
              <strong style="color:#10B981;font-size:24px;font-weight:900;">${totalPaid}</strong>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- IMPORTANT REMINDERS -->
    <div style="margin:0 24px 24px;background:#18140a;border:1px solid #3a3118;border-radius:12px;padding:20px;">
      <p style="margin:0 0 10px;color:#f59e0b;font-size:13px;font-weight:800;">⏰ Important Reminders</p>
      <ul style="margin:0;padding-left:20px;color:#d4c474;font-size:13px;line-height:2.0;">
        ${gateOpens ? `<li>Gates open at <strong>${gateOpens}</strong> — please arrive at least 20 mins early.</li>` : ''}
        ${showTime ? `<li>Show starts at <strong>${showTime}</strong> — latecomers may not be admitted.</li>` : ''}
        <li>Bring this QR code (attached PDF) for entry scanning at the door.</li>
        <li><strong>Do NOT share your QR code</strong> on social media or with others.</li>
        <li>Each QR code is unique and admits one person per scan.</li>
      </ul>
    </div>

    <!-- FOOTER -->
    <div style="background:#07070e;padding:28px 36px;text-align:center;border-top:1px solid #14141e;">
      <p style="color:#e23744;font-size:18px;font-weight:900;margin:0 0 6px;letter-spacing:-0.3px;">Celebr8 Events</p>
      <p style="color:#444;font-size:12px;margin:0 0 8px;">
        Need help? <a href="mailto:Celebr8events25@gmail.com" style="color:#e23744;text-decoration:none;">Celebr8events25@gmail.com</a>
      </p>
      <a href="https://celebr8events.co.uk" style="color:#888;text-decoration:none;font-size:11px;">celebr8events.co.uk</a>
      <p style="color:#333;font-size:11px;margin:12px 0 0;">© 2026 Celebr8 Events. All rights reserved.</p>
    </div>

  </div>
</body>
</html>`;

        // Build attachments
        const attachments = [];

        if (attachmentBase64) {
            const pdfData = attachmentBase64.includes(',') ? attachmentBase64.split(',')[1] : attachmentBase64;
            attachments.push({
                content: Buffer.from(pdfData, 'base64'),
                filename: `Celebr8_Ticket_${(eventTitle || 'Event').replace(/\s+/g, '_')}.pdf`,
                contentType: 'application/pdf',
                contentDisposition: 'attachment'
            });
        }

        if (attachmentImageBase64) {
            const imgData = attachmentImageBase64.includes(',') ? attachmentImageBase64.split(',')[1] : attachmentImageBase64;
            attachments.push({
                content: Buffer.from(imgData, 'base64'),
                filename: `Celebr8_Ticket_${(eventTitle || 'Event').replace(/\s+/g, '_')}.png`,
                contentType: 'image/png',
                contentDisposition: 'attachment'
            });
        }

        const mailOptions = {
            from: '"Celebr8 Events" <Celebr8events25@gmail.com>',
            to: customerEmail,
            subject: `🎫 Booking Confirmed — ${eventTitle} (${city})`,
            html: htmlContent,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Gmail ticket sent successfully to:', customerEmail, 'MessageID:', info.messageId);
        
        res.json({ success: true, message: 'Ticket emailed successfully' });

    } catch (err) {
        console.error('❌ Gmail delivery failed:', err);
        res.status(500).json({
            success: false,
            message: 'Email dispatch failed',
            error: err.message
        });
    }
});

// =======================================================
// Owner Dashboard — Generate Ticket PDF for a Booking
// =======================================================
router.get('/generate-pdf/:bookingId', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            where: { id: req.params.bookingId, status: 'confirmed' },
            include: [
                { model: User },
                { model: Event },
                {
                    model: Ticket,
                    include: [{ model: SeatInventory }]
                }
            ]
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found or not confirmed' });
        }

        // 3-month expiry check
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (new Date(booking.createdAt) < threeMonthsAgo) {
            return res.status(410).json({ success: false, message: 'This ticket PDF has expired (older than 3 months).' });
        }

        const event = booking.Event;
        const user = booking.User;
        const tickets = booking.Tickets || [];

        // Create PDF
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();

        // -- HEADER BAR --
        doc.setFillColor(226, 55, 68);
        doc.rect(0, 0, pageW, 38, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Celebr8 Events', pageW / 2, 16, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Official Ticket — Present QR Code at Entry', pageW / 2, 26, { align: 'center' });

        // -- EVENT DETAILS SECTION --
        let y = 50;
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('EVENT DETAILS', 20, y);
        y += 2;
        doc.setDrawColor(226, 55, 68);
        doc.setLineWidth(0.5);
        doc.line(20, y, pageW - 20, y);
        y += 8;

        doc.setFontSize(16);
        doc.setTextColor(20, 20, 20);
        doc.setFont('helvetica', 'bold');
        doc.text(event?.title || 'Event', 20, y);
        y += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const eventDate = event?.date ? new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—';
        doc.text(`Date:  ${eventDate}`, 20, y); y += 6;
        doc.text(`Venue:  ${event?.venue || '—'}, ${event?.city || ''}`, 20, y); y += 6;
        if (event?.gateOpens) { doc.text(`Gate Opens:  ${event.gateOpens}`, 20, y); y += 6; }
        if (event?.showTime) { doc.text(`Show Starts:  ${event.showTime}`, 20, y); y += 6; }

        // -- CUSTOMER DETAILS --
        y += 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text('BOOKING DETAILS', 20, y);
        y += 2;
        doc.setDrawColor(226, 55, 68);
        doc.line(20, y, pageW - 20, y);
        y += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Customer:  ${user?.name || 'Guest'}`, 20, y); y += 6;
        doc.text(`Email:  ${user?.email || '—'}`, 20, y); y += 6;
        if (user?.whatsapp) { doc.text(`WhatsApp:  ${user.whatsapp}`, 20, y); y += 6; }
        doc.text(`Booking Ref:  #${booking.id}`, 20, y); y += 6;
        doc.text(`Total Paid:  £${parseFloat(booking.totalAmount).toFixed(2)}`, 20, y); y += 6;
        const bookedDate = new Date(booking.createdAt).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        doc.text(`Booked On:  ${bookedDate}`, 20, y); y += 10;

        // -- TICKETS SECTION with QR Codes --
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text('TICKETS', 20, y);
        y += 2;
        doc.setDrawColor(226, 55, 68);
        doc.line(20, y, pageW - 20, y);
        y += 8;

        for (let i = 0; i < tickets.length; i++) {
            const t = tickets[i];
            const seat = t.SeatInventory;

            // Check if we need a new page
            if (y > 240) {
                doc.addPage();
                y = 20;
            }

            // Ticket card background
            doc.setFillColor(248, 248, 250);
            doc.roundedRect(18, y - 4, pageW - 36, 50, 3, 3, 'F');
            doc.setDrawColor(220, 220, 225);
            doc.roundedRect(18, y - 4, pageW - 36, 50, 3, 3, 'S');

            // Seat info
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(226, 55, 68);
            doc.text(`Seat: ${seat?.identifier || '—'}`, 24, y + 6);

            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.setFont('helvetica', 'normal');
            doc.text(`Zone: ${seat?.zone || '—'}`, 24, y + 14);
            doc.text(`Price: £${parseFloat(seat?.price || 0).toFixed(2)}`, 24, y + 22);
            doc.text(`Status: ${t.status === 'used' ? 'Checked In' : 'Valid'}`, 24, y + 30);

            // Generate QR code as data URI
            try {
                const qrDataUrl = await QRCode.toDataURL(t.qrCodeString || `celebr8-ticket:${t.id}`, {
                    width: 200, margin: 1, color: { dark: '#1a1a2e', light: '#ffffff' }
                });
                doc.addImage(qrDataUrl, 'PNG', pageW - 62, y - 2, 40, 40);
            } catch (qrErr) {
                console.warn('QR generation failed for ticket', t.id, qrErr.message);
                doc.setFontSize(8);
                doc.text('QR unavailable', pageW - 55, y + 18);
            }

            y += 56;
        }

        // -- FOOTER --
        y += 6;
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('This ticket is valid for one-time entry only. Do not share your QR code.', pageW / 2, y, { align: 'center' });
        y += 5;
        doc.text('© 2026 Celebr8 Events — celebr8events.co.uk', pageW / 2, y, { align: 'center' });

        // Output PDF as buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Celebr8_Ticket_Booking_${booking.id}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.send(pdfBuffer);

    } catch (err) {
        console.error('PDF generation error:', err);
        res.status(500).json({ success: false, message: 'Failed to generate ticket PDF', error: err.message });
    }
});

module.exports = router;
