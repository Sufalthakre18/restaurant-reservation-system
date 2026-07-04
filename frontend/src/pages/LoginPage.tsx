import { useState, type FormEvent } from 'react';
import { Link,  Navigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import Button from '../components/Button';

export default function LoginPage() {
  const { login, user } = useAuth();
  

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/book'} replace />;


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="animate-fade-up w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <UtensilsCrossed className="h-7 w-7 text-wine" />
          <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="text-sm text-muted">Log in to manage your table reservations.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          {error && (
            <p className="rounded-lg bg-rust-light px-3 py-2 text-sm text-rust">{error}</p>
          )}

          <Field
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{' '}
          <Link to="/register" className="font-medium text-wine hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
