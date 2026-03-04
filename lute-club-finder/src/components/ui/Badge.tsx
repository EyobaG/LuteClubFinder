import { type ReactNode } from 'react';
import type { ClubCategory } from '../../types';
import { CATEGORY_COLORS } from '../../types';

type BadgeColor = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'category';
  color?: BadgeColor;
  category?: ClubCategory;
  className?: string;
}

const colorStyles: Record<BadgeColor, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export default function Badge({
  children,
  variant = 'default',
  color = 'default',
  category,
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  if (variant === 'category' && category) {
    return (
      <span className={`${baseStyles} ${CATEGORY_COLORS[category]} ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span className={`${baseStyles} ${colorStyles[color]} ${className}`}>
      {children}
    </span>
  );
}
