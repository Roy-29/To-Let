import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import DashboardNav from '@/components/layout/DashboardNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle';
import styles from './DashboardLayout.module.css';

export default async function DashboardLayout(
  props: { children: React.ReactNode; params: Promise<any> }
) {
  const params = await props.params;
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Security check: ensure URL role matches the actual DB role
  const urlRole = params.role.toUpperCase();
  if (urlRole !== user.role) {
    redirect(`/${user.role.toLowerCase()}/dashboard`);
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
          {props.children}
        </main>
      </div>
    </div>
  );
}
