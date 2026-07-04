import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
      <CompassIcon className="h-8 w-8 text-wine" />
      <h1 className="font-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="text-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-2 text-sm font-medium text-wine hover:underline">
        Back to home
      </Link>
    </div>
  );
}
