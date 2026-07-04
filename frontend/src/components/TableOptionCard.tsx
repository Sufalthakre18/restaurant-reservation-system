import { Users, CheckCircle2, XCircle } from 'lucide-react';
import type { Table } from '../types';
import Button from './Button';

interface TableOptionCardProps {
  table: Table;
  guests: number;
  available: boolean;
  reserving: boolean;
  onReserve: () => void;
}

export default function TableOptionCard({ table, guests, available, reserving, onReserve }: TableOptionCardProps) {
  const fitsParty = guests <= table.capacity;

  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-surface p-4">
      <div>
        <p className="font-display text-base font-semibold text-ink">Table {table.tableNumber}</p>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <Users className="h-3.5 w-3.5" />
          Seats up to {table.capacity}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {available && fitsParty ? (
          <span className="flex items-center gap-1 text-sm font-medium text-sage">
            <CheckCircle2 className="h-4 w-4" /> Available
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm font-medium text-muted">
            <XCircle className="h-4 w-4" /> {fitsParty ? 'Booked' : 'Too small'}
          </span>
        )}
        <Button
          type="button"
          onClick={onReserve}
          disabled={!available || !fitsParty}
          loading={reserving}
          className="px-3 py-2 text-xs"
        >
          Reserve
        </Button>
      </div>
    </div>
  );
}
