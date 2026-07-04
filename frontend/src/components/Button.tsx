import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-wine text-white hover:bg-wine-dark',
  secondary: 'bg-sage text-white hover:opacity-90',
  ghost: 'bg-transparent text-ink border border-line hover:bg-black/[0.03]',
  danger: 'bg-transparent text-rust border border-rust/30 hover:bg-rust-light'
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium
        transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50
        ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
