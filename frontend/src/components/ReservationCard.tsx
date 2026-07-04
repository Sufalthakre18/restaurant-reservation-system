import { Users, CalendarDays, Clock3, Armchair } from 'lucide-react';
import type { Reservation } from '../types';
import { formatDate, formatTime } from '../utils/format';
import { ReservationStatusBadge, PaymentStatusBadge } from './StatusBadge';

interface ReservationCardProps {
  reservation: Reservation;
  /** Rendered inside the stub column - e.g. a Cancel button or admin actions */
  actions?: React.ReactNode;
  /** Shown only for admins, who need to know whose reservation this is */
  ownerName?: string;
}

export default function ReservationCard({ reservation, actions, ownerName }: ReservationCardProps) {
  const { table, date, startTime, endTime, guests, status, payment } = reservation;

  return (
    <div className="relative flex overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      {/* Main details */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ReservationStatusBadge status={status} />
          {payment.status !== 'not_required' && <PaymentStatusBadge status={payment.status} />}
        </div>

        {ownerName && <p className="text-xs font-medium text-muted">Booked by {ownerName}</p>}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-ink sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-wine" />
            {formatDate(date)}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-wine" />
            {formatTime(startTime)} – {formatTime(endTime)}
          </div>
          <div className="flex items-center gap-2">
            <Armchair className="h-4 w-4 text-wine" />
            Table {table.tableNumber}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-wine" />
            {guests} guest{guests > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Ticket-stub divider with punch-hole notches */}
      {actions && (
        <>
          <span
            aria-hidden
            className="absolute -top-2 h-4 w-4 rounded-full bg-paper"
            style={{ right: '5.5rem' }}
          />
          <span
            aria-hidden
            className="absolute -bottom-2 h-4 w-4 rounded-full bg-paper"
            style={{ right: '5.5rem' }}
          />
          <div className="flex w-24 flex-col items-center justify-center gap-2 border-l-2 border-dashed border-line px-3 py-5">
            {actions}
          </div>
        </>
      )}
    </div>
  );
}
