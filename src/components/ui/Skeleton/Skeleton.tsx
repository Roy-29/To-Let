import React from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      {...props}
    />
  );
}
