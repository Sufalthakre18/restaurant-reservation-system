import { useEffect, useState, type FormEvent } from 'react';
import { Loader2, Plus, Power, Users } from 'lucide-react';
import api, { getErrorMessage } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import type { Table } from '../../types';
import Button from '../../components/Button';
import Field from '../../components/Field';
import EmptyState from '../../components/EmptyState';

export default function ManageTablesPage() {
  const showToast = useToast();

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('');

  const fetchTables = async () => {
    try {
      const { data } = await api.get<{ data: Table[] }>('/tables');
      setTables(data.data);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/tables', { tableNumber: Number(tableNumber), capacity: Number(capacity) });
      showToast('Table added.', 'success');
      setTableNumber('');
      setCapacity('');
      fetchTables();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Deactivate this table? It will no longer accept new reservations.')) return;
    setBusyId(id);
    try {
      await api.delete(`/tables/${id}`);
      showToast('Table deactivated.', 'success');
      fetchTables();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="animate-fade-up mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Manage tables</h1>
        <p className="mt-1 text-sm text-muted">Add tables and control which ones are bookable.</p>
      </div>

      <form
        onSubmit={handleCreate}
        className="animate-fade-up mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-3"
      >
        <Field
          id="tableNumber"
          label="Table number"
          type="number"
          min={1}
          required
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="7"
        />
        <Field
          id="capacity"
          label="Seating capacity"
          type="number"
          min={1}
          required
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="4"
        />
        <div className="flex items-end">
          <Button type="submit" loading={creating} className="w-full">
            <Plus className="h-4 w-4" />
            Add table
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-wine" />
        </div>
      ) : tables.length === 0 ? (
        <EmptyState icon={Users} title="No tables yet" description="Add your first table above to start taking reservations." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tables
            .sort((a, b) => a.tableNumber - b.tableNumber)
            .map((table) => (
              <div key={table._id} className="flex items-center justify-between rounded-xl border border-line bg-surface p-4">
                <div>
                  <p className="font-display font-semibold text-ink">Table {table.tableNumber}</p>
                  <p className="text-xs text-muted">{table.capacity} seats</p>
                </div>
                <button
                  onClick={() => handleDeactivate(table._id)}
                  disabled={busyId === table._id}
                  title="Deactivate table"
                  className="rounded-lg p-2 text-muted hover:bg-rust-light hover:text-rust disabled:opacity-50"
                >
                  <Power className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
