import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import Button from '../components/Button';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) navigate(user.role === 'admin' ? '/admin' : '/book', { replace: true });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="animate-fade-up w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <UtensilsCrossed className="h-7 w-7 text-wine" />
          <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="text-sm text-muted">Book a table in under a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
          {error && <p className="rounded-lg bg-rust-light px-3 py-2 text-sm text-rust">{error}</p>}

          <Field id="name" label="Full name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
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
            placeholder="At least 6 characters"
          />

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-wine hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
