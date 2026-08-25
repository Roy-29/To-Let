import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import DashboardNav from '@/components/layout/DashboardNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle';
import styles from './DashboardLayout.module.css';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <DashboardNav userRole={user.role} />
      </aside>
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <span className={styles.greeting}>Welcome, {user.name}</span>
            <div className={styles.userMenu}>
              <ThemeToggle />
              <span className={styles.roleBadge}>{user.role}</span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className={styles.logoutBtn}>Log out</button>
              </form>
            </div>
          </div>
        </header>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
