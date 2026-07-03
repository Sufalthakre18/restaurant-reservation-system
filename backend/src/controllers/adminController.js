import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import { notifyUser } from '../utils/socket.js';
import { isTableAvailable } from './reservationController.js';


// @route  GET /api/admin/reservations
// @access Private/Admin
// Optional query params: date, status
const getAllReservations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.status) filter.status = req.query.status;

    const reservations = await Reservation.find(filter)
      .populate('user', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort('date startTime');

    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch reservations' });
  }
};

// @route  PUT /api/admin/reservations/:id
// @access Private/Admin
// Allows an admin to update the date/time/table/guests of a reservation, re-validating conflicts.
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const {
      table = reservation.table,
      date = reservation.date,
      startTime = reservation.startTime,
      endTime = reservation.endTime,
      guests = reservation.guests
    } = req.body;

    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'startTime must be before endTime' });
    }

    const available = await isTableAvailable({
      tableId: table,
      date,
      startTime,
      endTime,
      excludeReservationId: reservation._id
    });
    if (!available) {
      return res.status(409).json({
        success: false,
        message: 'Selected table is not available for that time slot'
      });
    }

    Object.assign(reservation, { table, date, startTime, endTime, guests });
    await reservation.save();
    await reservation.populate('table', 'tableNumber capacity');

    notifyUser(reservation.user.toString(), 'reservation:updated', { reservation });

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update reservation' });
  }
};

// @route  DELETE /api/admin/reservations/:id
// @access Private/Admin
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    notifyUser(reservation.user.toString(), 'reservation:cancelled', { reservationId: reservation._id });

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to cancel reservation' });
  }
};

// @route  POST /api/admin/create-admin
// @access Private/Admin
// Lets an existing admin promote/create another admin account (not exposed via public register).
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const admin = await User.create({ name, email, password, role: 'admin' });
    res.status(201).json({
      success: true,
      data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create admin' });
  }
};

export { getAllReservations, updateReservation, cancelReservation, createAdmin };
