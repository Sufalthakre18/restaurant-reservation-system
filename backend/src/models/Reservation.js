import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true
    },
    // Stored as 'YYYY-MM-DD' for simple, unambiguous date-only comparisons
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
    },
    // 24-hour 'HH:MM' format
    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'startTime must be in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'endTime must be in HH:MM format']
    },
    guests: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    payment: {
      status: {
        type: String,
        enum: ['not_required', 'pending', 'paid', 'failed'],
        default: 'not_required'
      },
      orderId: { type: String, default: null },
      paymentId: { type: String, default: null },
      amount: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Speeds up the availability/overlap query which filters by table + date + status
reservationSchema.index({ table: 1, date: 1, status: 1 });

const  Reservation= mongoose.model('Reservation', reservationSchema);
export default Reservation;