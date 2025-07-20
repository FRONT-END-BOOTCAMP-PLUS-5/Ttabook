'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import styles from './layout.module.css';
import { ProtectedRoute } from '../components/ProtectedRoute';
import Icon from '@/ds/components/atoms/icon/Icon';
import { usePosts } from '@/hooks/usePosts';
import { useSession } from '../providers/SessionProvider';

export default function SpaceLayout({ children }: { children: ReactNode }) {
  const onSuccess = () => {
    logout();
  };
  const onError = () => {};
  const pathname = usePathname();
  const { logout } = useSession();
  const { mutate } = usePosts({ onSuccess, onError });

  const handleClickLogout = () => {
    mutate({
      path: '/logout',
    });
  };

  return (
    <ProtectedRoute type="admin">
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.topSection}>
            <div className={styles.adminTitle}>admin</div>

            <nav className={styles.nav}>
              <Link
                href="/admin"
                className={`${styles.navLink} ${pathname === '/admin' ? styles.active : ''}`}
              >
                예약 관리
              </Link>
              <Link
                href="/admin/space"
                className={`${styles.navLink} ${pathname === '/admin/space' ? styles.active : ''}`}
              >
                공간 관리
              </Link>
            </nav>
          </div>

          <button onClick={handleClickLogout} className={styles.LogoutButton}>
            <Icon name="ic1_account" size={16} color="#000000" /> 로그아웃
          </button>
        </aside>

        <main className={styles.main}>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
