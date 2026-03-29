'use client';

import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  onBackClick?: () => void;
}

export function Header({ title, onMenuClick, onBackClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      {onBackClick ? (
        <button className={styles.iconButton} onClick={onBackClick}>
          ←
        </button>
      ) : onMenuClick ? (
        <button className={styles.iconButton} onClick={onMenuClick}>
          ☰
        </button>
      ) : (
        <div className={styles.iconButton} />
      )}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.iconButton} />
    </header>
  );
}
