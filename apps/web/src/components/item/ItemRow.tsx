'use client';

import { useRef, useState } from 'react';
import type { Item } from '@home-inventory/shared-types';
import styles from './ItemRow.module.css';

interface ItemRowProps {
  item: Item;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ItemRow({ item, onToggle, onDelete }: ItemRowProps) {
  const startX = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const breadcrumb = [item.space, item.zone, ...item.details]
    .filter(Boolean)
    .join(' > ');

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startX.current;
    if (diff < -10) {
      setSwiping(true);
      setOffsetX(Math.max(diff, -100));
    }
  };

  const handleTouchEnd = () => {
    if (offsetX < -60) {
      setOffsetX(-100);
    } else {
      setOffsetX(0);
    }
  };

  const handleClick = () => {
    if (!swiping) {
      onToggle(item.id);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.deleteAction}
        onClick={() => {
          setOffsetX(0);
          onDelete(item.id);
        }}
      >
        삭제
      </div>
      <div
        className={`${styles.row} ${!item.active ? styles.inactive : ''}`}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div
          className={`${styles.emoji} ${!item.active ? styles.emojiInactive : ''}`}
        >
          {item.emoji}
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{item.name}</p>
          <p className={styles.location}>{breadcrumb}</p>
        </div>
      </div>
    </div>
  );
}
