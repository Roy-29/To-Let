"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './DashboardNav.module.css';

interface NavItem {
  label: string;
  href: (role: string) => string;
}

const tenantNav: NavItem[] = [
  { label: 'Profile', href: (role) => `/${role}/profile` },
  { label: 'Find Homes', href: (role) => `/${role}/properties` },
  { label: 'Find User', href: (role) => `/${role}/search` },
  { label: 'Saved', href: (role) => `/${role}/saved` },
  { label: 'Applications', href: (role) => `/${role}/applications` },
  { label: 'Visits', href: (role) => `/${role}/visits` },
  { label: 'Messages', href: (role) => `/${role}/messages` },
  { label: 'Rent', href: (role) => `/${role}/rent` },
  { label: 'Maintenance', href: (role) => `/${role}/maintenance` },
];

const landlordNav: NavItem[] = [
  { label: 'Profile', href: (role) => `/${role}/profile` },
  { label: 'Properties', href: (role) => `/${role}/properties` },
  { label: 'Find User', href: (role) => `/${role}/search` },
  { label: 'Applications', href: (role) => `/${role}/applications` },
  { label: 'Tenants', href: (role) => `/${role}/tenants` },
  { label: 'Messages', href: (role) => `/${role}/messages` },
  { label: 'Rent', href: (role) => `/${role}/rent` },
  { label: 'Maintenance', href: (role) => `/${role}/maintenance` },
];

const adminNav: NavItem[] = [
  { label: 'Profile', href: (role) => `/${role}/profile` },
  { label: 'Users', href: (role) => `/${role}/users` },
  { label: 'Landlords', href: (role) => `/${role}/verifications` },
  { label: 'Properties', href: (role) => `/${role}/properties` },
  { label: 'Reports', href: (role) => `/${role}/reports` },
  { label: 'Analytics', href: (role) => `/${role}/analytics` },
  { label: 'Audit Logs', href: (role) => `/${role}/audit` },
];

export default function DashboardNav({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const roleStr = userRole.toLowerCase();
  
  let navItems: NavItem[] = [];
  if (userRole === 'TENANT') navItems = tenantNav;
  else if (userRole === 'LANDLORD') navItems = landlordNav;
  else if (userRole === 'ADMIN') navItems = adminNav;

  return (
    <nav className={styles.nav}>
      <div className={styles.logoContainer}>
        <Link href={`/${roleStr}/dashboard`} className={styles.logo}>Thikana</Link>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item) => {
          const itemHref = item.href(roleStr);
          const isActive = pathname === itemHref || (itemHref !== `/${roleStr}/dashboard` && itemHref !== '/properties' && pathname.startsWith(itemHref));
          return (
            <li key={itemHref}>
              <Link href={itemHref} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
