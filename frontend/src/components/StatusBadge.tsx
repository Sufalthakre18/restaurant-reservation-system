import { CheckCircle2, XCircle, Clock, CircleDollarSign } from 'lucide-react';
import type { PaymentStatus, ReservationStatus } from '../types';

const statusConfig: Record<ReservationStatus, { label: string; bg: string; text: string; Icon: typeof CheckCircle2 }> = {
  confirmed: { label: 'Confirmed', bg: 'bg-sage-light', text: 'text-sage', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', bg: 'bg-rust-light', text: 'text-rust', Icon: XCircle }
};

const paymentConfig: Record<PaymentStatus, { label: string; bg: string; text: string; Icon: typeof CheckCircle2 }> = {
  not_required: { label: 'No deposit', bg: 'bg-black/5', text: 'text-muted', Icon: Clock },
  pending: { label: 'Payment pending', bg: 'bg-gold-light', text: 'text-gold', Icon: CircleDollarSign },
  paid: { label: 'Deposit paid', bg: 'bg-sage-light', text: 'text-sage', Icon: CheckCircle2 },
  failed: { label: 'Payment failed', bg: 'bg-rust-light', text: 'text-rust', Icon: XCircle }
};

function Pill({ label, bg, text, Icon }: { label: string; bg: string; text: string; Icon: typeof CheckCircle2 }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <Pill {...statusConfig[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Pill {...paymentConfig[status]} />;
}
