"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './DashboardNav.module.css';

interface NavItem {
  label: string;
  href: string;
}

const tenantNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Find Homes', href: '/properties' },
  { label: 'Saved', href: '/dashboard/saved' },
  { label: 'Applications', href: '/dashboard/applications' },
  { label: 'Visits', href: '/dashboard/visits' },
  { label: 'Messages', href: '/dashboard/messages' },
  { label: 'Rent', href: '/dashboard/rent' },
  { label: 'Maintenance', href: '/dashboard/maintenance' },
];

const landlordNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Properties', href: '/dashboard/properties' },
  { label: 'Applications', href: '/dashboard/applications' },
  { label: 'Tenants', href: '/dashboard/tenants' },
  { label: 'Messages', href: '/dashboard/messages' },
  { label: 'Rent', href: '/dashboard/rent' },
  { label: 'Maintenance', href: '/dashboard/maintenance' },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Users', href: '/dashboard/users' },
  { label: 'Landlords', href: '/dashboard/verifications' },
  { label: 'Properties', href: '/dashboard/properties' },
  { label: 'Reports', href: '/dashboard/reports' },
  { label: 'Analytics', href: '/dashboard/analytics' },
  { label: 'Audit Logs', href: '/dashboard/audit' },
];

export default function DashboardNav({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  
  let navItems: NavItem[] = [];
  if (userRole === 'TENANT') navItems = tenantNav;
  else if (userRole === 'LANDLORD') navItems = landlordNav;
  else if (userRole === 'ADMIN') navItems = adminNav;

  return (
    <nav className={styles.nav}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>Thikana</Link>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link href={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
