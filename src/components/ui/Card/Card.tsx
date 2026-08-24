import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
}

export function Card({
  className = '',
  padding = 'md',
  shadow = 'sm',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles['p-' + padding]} ${styles['shadow-' + shadow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
