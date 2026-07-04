import { useState } from 'react';
import type { Reservation, Table } from '../types';
import { TIME_SLOTS } from '../types';
import Button from './Button';

interface AdminEditFormProps {
  reservation: Reservation;
  tables: Table[];
  saving: boolean;
  onSave: (updates: { table: string; date: string; startTime: string; endTime: string; guests: number }) => void;
  onCancel: () => void;
}

export default function AdminEditForm({ reservation, tables, saving, onSave, onCancel }: AdminEditFormProps) {
  const matchingSlot = TIME_SLOTS.findIndex((s) => s.startTime === reservation.startTime);

  const [tableId, setTableId] = useState(reservation.table._id);
  const [date, setDate] = useState(reservation.date);
  const [slotIndex, setSlotIndex] = useState(matchingSlot >= 0 ? matchingSlot : 0);
  const [guests, setGuests] = useState(reservation.guests);

  const slot = TIME_SLOTS[slotIndex];

  return (
    <div className="rounded-2xl border border-wine/30 bg-wine-light/40 p-5">
      <p className="mb-3 text-sm font-semibold text-ink">Reschedule reservation</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select
          value={tableId}
          onChange={(e) => setTableId(e.target.value)}
          className="rounded-lg border border-line bg-surface px-2.5 py-2 text-sm focus:border-wine"
        >
          {tables.map((t) => (
            <option key={t._id} value={t._id}>
              Table {t.tableNumber} ({t.capacity} seats)
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-line bg-surface px-2.5 py-2 text-sm focus:border-wine"
        />

        <select
          value={slotIndex}
          onChange={(e) => setSlotIndex(Number(e.target.value))}
          className="rounded-lg border border-line bg-surface px-2.5 py-2 text-sm focus:border-wine"
        >
          {TIME_SLOTS.map((s, i) => (
            <option key={s.startTime} value={i}>
              {s.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="rounded-lg border border-line bg-surface px-2.5 py-2 text-sm focus:border-wine"
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" className="px-3 py-2 text-xs" onClick={onCancel}>
          Discard
        </Button>
        <Button
          className="px-3 py-2 text-xs"
          loading={saving}
          onClick={() => onSave({ table: tableId, date, startTime: slot.startTime, endTime: slot.endTime, guests })}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
