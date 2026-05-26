'use client';

import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
}

export default function Button({
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-primary-700 text-white hover:bg-primary-800',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };
  const sizes = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
