import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle';
import styles from './PublicLayout.module.css';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/homepage" className={styles.logo}>
            Thikana
          </Link>
          <nav className={styles.nav}>
            <Link href="/properties" className={styles.navLink}>Find Homes</Link>
            <Link href="/about" className={styles.navLink}>About</Link>
          </nav>
          <div className={styles.actions}>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.footerText}>© {new Date().getFullYear()} Thikana. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
