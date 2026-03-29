'use client';

import styles from './FAB.module.css';

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button className={styles.fab} onClick={onClick}>
      +
    </button>
  );
}
