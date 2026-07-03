import Reservation from "../models/Reservation"
import Table from "../models/Table";
import { notifyAdmins } from "../utils/socket";



// HH:MM strings are zero-padded 24h format, so lexicographic comparison
// is equivalent to chronological comparison - no need to parse into Date objects.
const timesOverlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

/**
 * Checks whether a table is free for the given date/time window.
 * Only 'confirmed' reservations block availability; cancelled ones don't.
 */
const isTableAvailable = async ({ tableId, date, startTime, endTime, excludeReservationId = null }) => {
  const query = { table: tableId, date, status: 'confirmed' };
  if (excludeReservationId) query._id = { $ne: excludeReservationId };

  const existingReservations = await Reservation.find(query);
  return !existingReservations.some((r) => timesOverlap(startTime, endTime, r.startTime, r.endTime));
};

// @route  POST /api/reservations
// @access Private/Customer
const createReservation = async (req, res) => {
  try {
    const { tableId, date, startTime, endTime, guests } = req.body;

    if (!tableId || !date || !startTime || !endTime || !guests) {
      return res.status(400).json({
        success: false,
        message: 'tableId, date, startTime, endTime and guests are required'
      });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'startTime must be before endTime' });
    }

    const table = await Table.findOne({ _id: tableId, isActive: true });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found or inactive' });
    }

    if (guests > table.capacity) {
      return res.status(400).json({
        success: false,
        message: `Table ${table.tableNumber} only seats up to ${table.capacity} guests`
      });
    }

    const available = await isTableAvailable({ tableId, date, startTime, endTime });
    if (!available) {
      return res.status(409).json({
        success: false,
        message: 'This table is already booked for the selected time slot'
      });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date,
      startTime,
      endTime,
      guests,
      payment: { status: 'not_required' }
    });

    await reservation.populate('table', 'tableNumber capacity');

    //  real-time notification to the admin dashboard
    notifyAdmins('reservation:created', { reservation });

    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create reservation' });
  }
};

// @route  GET /api/reservations/my
// @access Private/Customer
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table', 'tableNumber capacity')
      .sort('-date -startTime');

    res.status(200).json({ success: true, count: reservations.length, data: reservations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch reservations' });
  }
};

// @route  DELETE /api/reservations/:id
// @access Private/Customer (own reservation only)
const cancelMyReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own reservations' });
    }
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Reservation is already cancelled' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    notifyAdmins('reservation:cancelled', { reservationId: reservation._id });

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to cancel reservation' });
  }
};

// @route  GET /api/reservations/availability?tableId=&date=&startTime=&endTime=&guests=
// @access Private
// Helper endpoint so the frontend can check before submitting a booking.
const checkAvailability = async (req, res) => {
  try {
    const { tableId, date, startTime, endTime, guests } = req.query;
    if (!tableId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'tableId, date, startTime and endTime are required'
      });
    }

    const table = await Table.findOne({ _id: tableId, isActive: true });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found or inactive' });
    }

    const capacityOk = guests ? Number(guests) <= table.capacity : true;
    const available = capacityOk && (await isTableAvailable({ tableId, date, startTime, endTime }));

    res.status(200).json({ success: true, data: { available } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to check availability' });
  }
};

export {
  createReservation,
  getMyReservations,
  cancelMyReservation,
  checkAvailability,
  isTableAvailable
};
