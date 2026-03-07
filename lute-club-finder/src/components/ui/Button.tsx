import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
  // PLU gold background, black text — bold and on-brand
  primary:   'bg-plu-gold text-plu-black font-bold hover:bg-plu-gold-deep focus:ring-plu-gold',
  // PLU black background, white text
  secondary: 'bg-plu-black text-white font-semibold hover:bg-plu-dark-gray focus:ring-plu-black',
  // Gold border, black text; fills gold on hover
  outline:   'border-2 border-plu-gold text-plu-black font-semibold hover:bg-plu-gold focus:ring-plu-gold',
  // Subtle ghost — dark text, light hover
  ghost:     'text-plu-black font-medium hover:bg-plu-gray focus:ring-gray-400',
  danger:    'bg-red-600 text-white font-semibold hover:bg-red-700 focus:ring-red-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[44px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
