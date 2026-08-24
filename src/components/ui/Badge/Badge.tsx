import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
}

export function Badge({
  className = '',
  variant = 'primary',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
