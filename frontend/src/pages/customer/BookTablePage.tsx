import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CalendarDays, Users } from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TIME_SLOTS, type Table } from '../../types';
import { todayISO } from '../../utils/format';
import Button from '../../components/Button';
import TableOptionCard from '../../components/TableOptionCard';
import EmptyState from '../../components/EmptyState';

interface TableResult extends Table {
  available: boolean;
}

const DEPOSIT_AMOUNT = 200; // flat deposit in INR, kept simple and fixed

export default function BookTablePage() {
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [date, setDate] = useState(todayISO());
  const [slotIndex, setSlotIndex] = useState(0);
  const [guests, setGuests] = useState(2);

  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<TableResult[]>([]);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const slot = TIME_SLOTS[slotIndex];

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSearching(true);
    setSearched(false);

    try {
      const { data: tablesRes } = await api.get<{ data: Table[] }>('/tables');
      const tables = tablesRes.data;

      const availability = await Promise.all(
        tables.map(async (table) => {
          const { data } = await api.get<{ data: { available: boolean } }>('/reservations/availability', {
            params: { tableId: table._id, date, startTime: slot.startTime, endTime: slot.endTime, guests }
          });
          return { ...table, available: data.data.available };
        })
      );

      setResults(availability);
      setSearched(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const handleReserve = async (table: TableResult) => {
    setReservingId(table._id);
    setError('');

    try {
      const { data } = await api.post('/reservations', {
        tableId: table._id,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        guests
      });
      const reservationId = data.data._id as string;

      showToast('Table reserved. Redirecting to your reservations…', 'success');

      // Optional deposit flow - offer it, but never block the booking on it
      const wantsDeposit = window.confirm(
        `Reservation confirmed! Would you like to pay a ₹${DEPOSIT_AMOUNT} deposit now to secure it?`
      );

      if (wantsDeposit && user) {
        const { data: orderRes } = await api.post('/payments/create-order', {
          reservationId,
          amount: DEPOSIT_AMOUNT
        });

        await openRazorpayCheckout({
          orderId: orderRes.data.orderId,
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: user.name,
          email: user.email,
          onSuccess: async (response) => {
            try {
              await api.post('/payments/verify', { reservationId, ...response });
              showToast('Deposit paid successfully.', 'success');
            } catch (err) {
              showToast(getErrorMessage(err), 'error');
            }
            navigate('/my-reservations');
          },
          onDismiss: () => navigate('/my-reservations')
        });
      } else {
        navigate('/my-reservations');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="animate-fade-up mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Reserve a table</h1>
        <p className="mt-1 text-sm text-muted">Pick a date, time and party size to see what's open.</p>
      </div>

      <form
        onSubmit={handleSearch}
        className="animate-fade-up grid grid-cols-1 gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-4"
      >
        <div className="flex flex-col gap-1.5 sm:col-span-1">
          <label htmlFor="date" className="text-sm font-medium text-ink">Date</label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="date"
              type="date"
              min={todayISO()}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink focus:border-wine"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="slot" className="text-sm font-medium text-ink">Time</label>
          <select
            id="slot"
            value={slotIndex}
            onChange={(e) => setSlotIndex(Number(e.target.value))}
            className="rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink focus:border-wine"
          >
            {TIME_SLOTS.map((s, i) => (
              <option key={s.startTime} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-1">
          <label htmlFor="guests" className="text-sm font-medium text-ink">Guests</label>
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="guests"
              type="number"
              min={1}
              max={20}
              required
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink focus:border-wine"
            />
          </div>
        </div>

        <Button type="submit" loading={searching} className="sm:col-span-4">
          <Search className="h-4 w-4" />
          Find a table
        </Button>
      </form>

      {error && <p className="mt-4 rounded-lg bg-rust-light px-3 py-2 text-sm text-rust">{error}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {searched && results.length === 0 && (
          <EmptyState icon={Search} title="No tables found" description="There aren't any tables configured yet. Please check back later." />
        )}

        {searched &&
          results.length > 0 &&
          results
            .sort((a, b) => a.tableNumber - b.tableNumber)
            .map((table) => (
              <TableOptionCard
                key={table._id}
                table={table}
                guests={guests}
                available={table.available}
                reserving={reservingId === table._id}
                onReserve={() => handleReserve(table)}
              />
            ))}
      </div>
    </div>
  );
}
