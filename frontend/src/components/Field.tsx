import type { InputHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Field({ label, id, className = '', ...rest }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink
          placeholder:text-muted/70 focus:border-wine
          ${className}`}
        {...rest}
      />
    </div>
  );
}
