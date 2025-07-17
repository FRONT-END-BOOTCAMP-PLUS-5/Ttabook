'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import styles from './layout.module.css';

export default function SpaceLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ←
        </button>

        <div className={styles.adminTitle}>admin</div>

        <nav className={styles.nav}>
          <Link
            href="/admin"
            className={`${styles.navLink} ${pathname === '/admin' ? styles.active : ''}`}
          >
            예약 관리
          </Link>
          <Link
            href="/admin/space" className={`${styles.navLink} ${pathname === '/admin/space' ? styles.active : ''}`}
          >
            공간 관리
          </Link>
        </nav>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}