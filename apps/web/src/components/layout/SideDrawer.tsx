'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import styles from './SideDrawer.module.css';

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SideDrawer({ open, onClose }: SideDrawerProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const handleLogout = () => {
    onClose();
    logout();
    router.push('/login');
  };

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <nav className={`${styles.drawer} ${open ? styles.open : ''}`}>
        <div className={styles.header}>
          <p className={styles.title}>우리집</p>
          <p className={styles.subtitle}>물어보지 않아도 되는 집</p>
        </div>

        <div className={styles.menu}>
          <button className={styles.menuItem} onClick={() => navigate('/')}>
            🏠 홈
          </button>
          <button
            className={styles.menuItem}
            onClick={() => navigate('/members')}
          >
            👥 같이 쓰는 사람들
          </button>
        </div>

        <button className={styles.logout} onClick={handleLogout}>
          로그아웃
        </button>
      </nav>
    </>
  );
}
