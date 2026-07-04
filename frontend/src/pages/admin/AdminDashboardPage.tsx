import { useCallback, useEffect, useState } from 'react';
import { CalendarSearch, Loader2, Pencil, XCircle } from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useToast } from '../../context/ToastContext';
import type { Reservation, ReservationStatus, Table } from '../../types';
import ReservationCard from '../../components/ReservationCard';
import AdminEditForm from '../../components/AdminEditForm';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

export default function AdminDashboardPage() {
  const showToast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');

  const fetchReservations = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;

      const { data } = await api.get<{ data: Reservation[] }>('/admin/reservations', { params });
      setReservations(data.data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter, showToast]);

  useEffect(() => {
    api
      .get<{ data: Table[] }>('/tables')
      .then((res) => setTables(res.data.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetchReservations();

    // Real-time: refresh the dashboard the moment any customer books, cancels, or pays
    const socket = getSocket();
    const handleLiveUpdate = (label: string) => {
      showToast(label, 'info');
      fetchReservations();
    };
    const onCreated = () => handleLiveUpdate('A new reservation just came in.');
    const onCancelled = () => handleLiveUpdate('A reservation was cancelled.');
    const onPaid = () => handleLiveUpdate('A deposit was just paid.');

    socket?.on('reservation:created', onCreated);
    socket?.on('reservation:cancelled', onCancelled);
    socket?.on('reservation:paid', onPaid);

    return () => {
      socket?.off('reservation:created', onCreated);
      socket?.off('reservation:cancelled', onCancelled);
      socket?.off('reservation:paid', onPaid);
    };
  }, [fetchReservations, showToast]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this reservation?')) return;
    setBusyId(id);
    try {
      await api.delete(`/admin/reservations/${id}`);
      showToast('Reservation cancelled.', 'success');
      fetchReservations();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveEdit = async (
    id: string,
    updates: { table: string; date: string; startTime: string; endTime: string; guests: number }
  ) => {
    setBusyId(id);
    try {
      await api.put(`/admin/reservations/${id}`, updates);
      showToast('Reservation updated.', 'success');
      setEditingId(null);
      fetchReservations();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="animate-fade-up mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">All reservations</h1>
          <p className="mt-1 text-sm text-muted">Live view across every table in the restaurant.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-wine"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | '')}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-wine"
          >
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-wine" />
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState icon={CalendarSearch} title="No reservations match" description="Try a different date or clear the status filter." />
      ) : (
        <div className="flex flex-col gap-4">
          {reservations.map((reservation) => {
            const owner = typeof reservation.user === 'object' ? reservation.user.name : undefined;

            if (editingId === reservation._id) {
              return (
                <AdminEditForm
                  key={reservation._id}
                  reservation={reservation}
                  tables={tables}
                  saving={busyId === reservation._id}
                  onSave={(updates) => handleSaveEdit(reservation._id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              );
            }

            return (
              <ReservationCard
                key={reservation._id}
                reservation={reservation}
                ownerName={owner}
                actions={
                  reservation.status === 'confirmed' ? (
                    <>
                      <Button variant="ghost" className="w-full px-2 py-2 text-xs" onClick={() => setEditingId(reservation._id)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="w-full px-2 py-2 text-xs"
                        loading={busyId === reservation._id}
                        onClick={() => handleCancel(reservation._id)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
