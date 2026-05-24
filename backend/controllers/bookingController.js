const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/* ══════════════════════════════════════════════════
   EMAIL TEMPLATES
══════════════════════════════════════════════════ */

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0b1528 0%,#1a2d50 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;font-weight:600;">Lumière Hotel</p>
            <h1 style="margin:8px 0 0;font-size:28px;color:#ffffff;font-weight:300;letter-spacing:1px;">Reservation Management</h1>
            <div style="width:40px;height:2px;background:#c9a84c;margin:16px auto 0;"></div>
          </td>
        </tr>

        <!-- Body -->
        <tr><td style="padding:40px;">${content}</td></tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              Lumière Hotel &nbsp;•&nbsp; Luxury &amp; Comfort<br>
              <span style="color:#c9a84c;">reservations@lumiere.com</span> &nbsp;•&nbsp; +94 11 234 5678
            </p>
            <p style="margin:12px 0 0;font-size:11px;color:#cbd5e1;">This is an automated message. Please do not reply directly to this email.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

/* ── Booking Confirmation Email ── */
const buildConfirmationEmail = (userName, room, checkIn, checkOut, totalPrice, daysToStay, bookingId) => {
    const content = `
    <!-- Greeting -->
    <h2 style="margin:0 0 6px;font-size:22px;color:#0b1528;font-weight:600;">Booking Confirmed! 🎉</h2>
    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
      Dear <strong style="color:#0b1528;">${userName}</strong>, your reservation has been successfully confirmed.
      We look forward to welcoming you at Lumière Hotel.
    </p>

    <!-- Status Banner -->
    <div style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:10px;padding:14px 20px;margin-bottom:28px;display:flex;align-items:center;">
      <span style="font-size:20px;margin-right:10px;">✅</span>
      <div>
        <p style="margin:0;font-size:13px;font-weight:700;color:#065f46;text-transform:uppercase;letter-spacing:0.5px;">Reservation Status</p>
        <p style="margin:2px 0 0;font-size:18px;font-weight:800;color:#065f46;">CONFIRMED</p>
      </div>
    </div>

    <!-- Booking Details Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
      <tr><td colspan="2" style="background:#0b1528;padding:14px 20px;">
        <p style="margin:0;font-size:11px;letter-spacing:1.5px;color:#c9a84c;text-transform:uppercase;font-weight:600;">Reservation Details</p>
      </td></tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;width:40%;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Room</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">Room ${room.room_number}</p>
        </td>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Room Type</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${room.type}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Check-in</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${checkIn.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}</p>
        </td>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Check-out</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${checkOut.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'long', year:'numeric' })}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Duration</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${daysToStay} Night${daysToStay > 1 ? 's' : ''}</p>
        </td>
        <td style="padding:16px 20px;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Rate per Night</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">LKR ${Number(room.price).toLocaleString()}</p>
        </td>
      </tr>
    </table>

    <!-- Total Price -->
    <div style="background:linear-gradient(135deg,#0b1528,#1a2d50);border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#c9a84c;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total Amount</p>
      <p style="margin:6px 0 0;font-size:32px;font-weight:800;color:#ffffff;letter-spacing:1px;">LKR ${Number(totalPrice).toLocaleString()}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">${daysToStay} night${daysToStay > 1 ? 's' : ''} × LKR ${Number(room.price).toLocaleString()}</p>
    </div>

    <!-- Note -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
        <strong>📌 Important:</strong> Please present this confirmation and a valid ID at the reception upon check-in.
        Check-in time is from <strong>2:00 PM</strong> and check-out is by <strong>12:00 PM</strong>.
      </p>
    </div>`;
    return emailWrapper(content);
};

/* ── Checkout / Payment Summary Email ── */
const buildCheckoutEmail = (userName, room, checkIn, checkOut, totalPrice, daysToStay) => {
    const content = `
    <!-- Greeting -->
    <h2 style="margin:0 0 6px;font-size:22px;color:#0b1528;font-weight:600;">Thank You for Your Stay! 🌟</h2>
    <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
      Dear <strong style="color:#0b1528;">${userName}</strong>, we hope you had a wonderful experience at Lumière Hotel.
      Below is your stay summary and payment details.
    </p>

    <!-- Status Banner -->
    <div style="background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-radius:10px;padding:14px 20px;margin-bottom:28px;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#5b21b6;text-transform:uppercase;letter-spacing:0.5px;">Stay Status</p>
      <p style="margin:2px 0 0;font-size:18px;font-weight:800;color:#5b21b6;">CHECKED OUT ✔</p>
    </div>

    <!-- Stay Details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:28px;">
      <tr><td colspan="2" style="background:#0b1528;padding:14px 20px;">
        <p style="margin:0;font-size:11px;letter-spacing:1.5px;color:#c9a84c;text-transform:uppercase;font-weight:600;">Stay Summary</p>
      </td></tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;width:40%;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Room</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">Room ${room.room_number} (${room.type})</p>
        </td>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Duration</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${daysToStay} Night${daysToStay > 1 ? 's' : ''}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Arrived</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${checkIn.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
        </td>
        <td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Departed</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">${checkOut.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;" colspan="2">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Rate per Night</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0f172a;">LKR ${Number(room.price).toLocaleString()}</p>
        </td>
      </tr>
    </table>

    <!-- Payment Due -->
    <div style="background:linear-gradient(135deg,#0b1528,#1a2d50);border-radius:12px;padding:20px 24px;margin-bottom:28px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#c9a84c;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total Payment</p>
      <p style="margin:6px 0 0;font-size:32px;font-weight:800;color:#ffffff;letter-spacing:1px;">LKR ${Number(totalPrice).toLocaleString()}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">${daysToStay} night${daysToStay > 1 ? 's' : ''} × LKR ${Number(room.price).toLocaleString()}</p>
    </div>

    <!-- Thank you note -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#166534;line-height:1.6;">
        🙏 <strong>Thank you for choosing Lumière Hotel!</strong> We hope to see you again soon.
        Share your experience — your feedback means the world to us.
      </p>
    </div>`;
    return emailWrapper(content);
};

/* ══════════════════════════════════════════════════
   CONTROLLERS
══════════════════════════════════════════════════ */

/* ─── Customer Booking (registered user) ─── */
const createBooking = async (req, res) => {
    try {
        const { room_id, check_in_date, check_out_date } = req.body;
        const user_id = req.user._id;

        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);

        if (checkIn >= checkOut) {
            return res.status(400).json({ message: "Check-out date must be after check-in date" });
        }

        const overlappingBooking = await Booking.findOne({
            room: room_id,
            status: { $ne: 'Cancelled' },
            $or: [{ check_in_date: { $lt: checkOut }, check_out_date: { $gt: checkIn } }]
        });
        if (overlappingBooking) {
            return res.status(400).json({ message: "Sorry! This room is already booked for these dates." });
        }

        const room = await Room.findById(room_id);
        if (!room) return res.status(400).json({ message: "Room not found!" });
        if (room.status === 'Maintenance') {
            return res.status(400).json({ message: "Sorry! This room is currently under maintenance and cannot be booked." });
        }

        const daysToStay = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));
        const total_price = daysToStay * room.price;

        const booking = await Booking.create({
            user: user_id,
            room: room_id,
            check_in_date: checkIn,
            check_out_date: checkOut,
            total_price,
            status: 'Confirmed'
        });

        // Send modern HTML confirmation email instantly
        if (req.user && req.user.email) {
            const htmlBody = buildConfirmationEmail(
                req.user.full_name, room, checkIn, checkOut, total_price, daysToStay, booking._id
            );
            transporter.sendMail({
                from: `"Lumière Hotel" <${process.env.EMAIL_USER}>`,
                to: req.user.email,
                subject: '✅ Booking Confirmed — Lumière Hotel',
                html: htmlBody
            }).catch(err => console.error('Confirmation email failed:', err));
        }

        res.status(201).json({ message: "Room booked successfully!", booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/* ─── Manager / Walk-in Booking ─── */
const createAdminBooking = async (req, res) => {
    try {
        const {
            full_name, identity_type, identity_number,
            address, phone, room_id, check_in_date, check_out_date
        } = req.body;

        if (!full_name || !identity_type || !identity_number || !address || !phone || !room_id || !check_in_date || !check_out_date) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);

        if (checkIn >= checkOut) {
            return res.status(400).json({ message: "Check-out date must be after check-in date" });
        }

        const overlappingBooking = await Booking.findOne({
            room: room_id,
            status: { $ne: 'Cancelled' },
            $or: [{ check_in_date: { $lt: checkOut }, check_out_date: { $gt: checkIn } }]
        });
        if (overlappingBooking) {
            return res.status(400).json({ message: "Sorry! This room is already booked for these dates." });
        }

        const room = await Room.findById(room_id);
        if (!room) return res.status(400).json({ message: "Room not found!" });
        if (room.status === 'Maintenance') {
            return res.status(400).json({ message: "Sorry! This room is currently under maintenance." });
        }

        const daysToStay = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));
        const total_price = daysToStay * room.price;

        // Only look up registered user to optionally link — never create or modify Users table
        const registeredUser = await User.findOne({ identity_number });

        const booking = await Booking.create({
            user: registeredUser ? registeredUser._id : null,
            guest_name: full_name,
            guest_phone: phone,
            guest_address: address,
            guest_identity_type: identity_type,
            guest_identity_number: identity_number,
            room: room_id,
            check_in_date: checkIn,
            check_out_date: checkOut,
            total_price,
            status: 'Confirmed'
        });

        // Walk-in guests have no email — no email sent
        res.status(201).json({ message: "Booking created successfully!", booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/* ─── Get All Bookings (Admin) ─── */
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'full_name email identity_number phone address')
            .populate('room', 'room_number type price')
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/* ─── Update Booking Status ─── */
const updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'full_name email')
            .populate('room', 'room_number type price');

        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const newStatus = req.body.status;
        booking.status = newStatus;
        await booking.save();

        // Send checkout payment summary email ONLY to registered users (not walk-ins)
        if (newStatus === 'Checked-out' && booking.user && booking.user.email && !booking.guest_name) {
            const checkIn = new Date(booking.check_in_date);
            const checkOut = new Date(booking.check_out_date);
            const daysToStay = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));

            const htmlBody = buildCheckoutEmail(
                booking.user.full_name,
                booking.room,
                checkIn,
                checkOut,
                booking.total_price,
                daysToStay
            );

            transporter.sendMail({
                from: `"Lumière Hotel" <${process.env.EMAIL_USER}>`,
                to: booking.user.email,
                subject: '🏨 Stay Complete — Payment Summary | Lumière Hotel',
                html: htmlBody
            }).catch(err => console.error('Checkout email failed:', err));
        }

        res.status(200).json({ message: `Booking status updated to ${booking.status}`, booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/* ─── Get My Bookings (Customer) ─── */
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('room', 'room_number type price image_url');

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

/* ─── Cancel Booking (Customer) ─── */
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        if (booking.status === 'Checked-in' || booking.status === 'Checked-out') {
            return res.status(400).json({ message: "Cannot cancel a booking that has already started" });
        }

        booking.status = 'Cancelled';
        await booking.save();

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = { createBooking, createAdminBooking, getAllBookings, updateBookingStatus, getMyBookings, cancelBooking };