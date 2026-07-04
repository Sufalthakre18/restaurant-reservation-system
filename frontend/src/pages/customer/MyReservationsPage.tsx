import { useCallback, useEffect, useState } from 'react';
import { CalendarX2, Loader2, XCircle, CircleDollarSign } from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Reservation } from '../../types';
import ReservationCard from '../../components/ReservationCard';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const showToast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    try {
      const { data } = await api.get<{ data: Reservation[] }>('/reservations/my');
      setReservations(data.data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReservations();

    // Live refresh if an admin updates/cancels one of this customer's reservations
    const socket = getSocket();
    socket?.on('reservation:updated', fetchReservations);
    socket?.on('reservation:cancelled', fetchReservations);
    return () => {
      socket?.off('reservation:updated', fetchReservations);
      socket?.off('reservation:cancelled', fetchReservations);
    };
  }, [fetchReservations]);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this reservation?')) return;
    setBusyId(id);
    try {
      await api.delete(`/reservations/${id}`);
      showToast('Reservation cancelled.', 'success');
      fetchReservations();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handlePayDeposit = async (reservation: Reservation) => {
    if (!user || !reservation.payment.orderId) return;
    setBusyId(reservation._id);

    try {
      await openRazorpayCheckout({
        orderId: reservation.payment.orderId,
        amount: reservation.payment.amount * 100,
        currency: 'INR',
        name: user.name,
        email: user.email,
        onSuccess: async (response) => {
          try {
            await api.post('/payments/verify', { reservationId: reservation._id, ...response });
            showToast('Deposit paid successfully.', 'success');
          } catch (err) {
            showToast(getErrorMessage(err), 'error');
          }
          fetchReservations();
        },
        onDismiss: () => setBusyId(null)
      });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-wine" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="animate-fade-up mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">My reservations</h1>
        <p className="mt-1 text-sm text-muted">Everything you've booked, past and upcoming.</p>
      </div>

      {reservations.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="No reservations yet"
          description="Once you book a table, it will show up here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              actions={
                <>
                  {reservation.payment.status === 'pending' && (
                    <Button
                      variant="secondary"
                      className="w-full px-2 py-2 text-xs"
                      loading={busyId === reservation._id}
                      onClick={() => handlePayDeposit(reservation)}
                    >
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      Pay
                    </Button>
                  )}
                  {reservation.status === 'confirmed' && (
                    <Button
                      variant="danger"
                      className="w-full px-2 py-2 text-xs"
                      loading={busyId === reservation._id}
                      onClick={() => handleCancel(reservation._id)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
