import crypto from "crypto";
import Razorpay from "razorpay";
import Reservation from "../models/Reservation";
import { notifyAdmins } from "../utils/socket";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route  POST /api/payments/create-order
// @access Private/Customer
// Creates a Razorpay order for an optional reservation deposit (e.g. to hold the table).
const createOrder = async (req, res) => {
  try {
    const { reservationId, amount } = req.body; // amount in INR (rupees)
    if (!reservationId || !amount) {
      return res.status(400).json({ success: false, message: 'reservationId and amount are required' });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only pay for your own reservation' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `reservation_${reservation._id}`
    });

    reservation.payment.status = 'pending';
    reservation.payment.orderId = order.id;
    reservation.payment.amount = amount;
    await reservation.save();

    res.status(201).json({
      success: true,
      data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create payment order' });
  }
};

// @route  POST /api/payments/verify
// @access Private/Customer
// Verifies the payment signature returned by Razorpay checkout on the frontend.
const verifyPayment = async (req, res) => {
  try {
    const { reservationId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!reservationId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    if (reservation.payment.orderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Order ID does not match this reservation' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      reservation.payment.status = 'failed';
      await reservation.save();
      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    reservation.payment.status = 'paid';
    reservation.payment.paymentId = razorpay_payment_id;
    await reservation.save();

    notifyAdmins('reservation:paid', { reservationId: reservation._id });

    res.status(200).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Payment verification failed' });
  }
};

export { createOrder, verifyPayment };
