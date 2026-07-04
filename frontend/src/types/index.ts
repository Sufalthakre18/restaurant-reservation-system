export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  isActive: boolean;
}

export type ReservationStatus = 'confirmed' | 'cancelled';
export type PaymentStatus = 'not_required' | 'pending' | 'paid' | 'failed';

export interface Payment {
  status: PaymentStatus;
  orderId: string | null;
  paymentId: string | null;
  amount: number;
}

export interface Reservation {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  table: Table;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  guests: number;
  status: ReservationStatus;
  payment: Payment;
  createdAt: string;
}

// Fixed dining slots - kept on the frontend since the backend accepts any
// startTime/endTime pair. A fixed list gives customers a simple picker
// instead of a free-form time input.
export interface TimeSlot {
  label: string;
  startTime: string;
  endTime: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { label: '12:00 PM – 1:30 PM', startTime: '12:00', endTime: '13:30' },
  { label: '1:30 PM – 3:00 PM', startTime: '13:30', endTime: '15:00' },
  { label: '7:00 PM – 8:30 PM', startTime: '19:00', endTime: '20:30' },
  { label: '8:30 PM – 10:00 PM', startTime: '20:30', endTime: '22:00' }
];

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}
