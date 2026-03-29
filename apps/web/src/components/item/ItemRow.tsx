'use client';

import { useRef, useState } from 'react';
import type { Item } from '@home-inventory/shared-types';
import styles from './ItemRow.module.css';

interface ItemRowProps {
  item: Item;
  onTap: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function ItemRow({ item, onTap, onDelete }: ItemRowProps) {
  const startX = useRef(0);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const breadcrumb = [item.space, item.zone, ...item.details]
    .filter(Boolean)
    .join(' > ');

  const inactive = item.quantity === 0;

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
      onTap(item);
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
        className={`${styles.row} ${inactive ? styles.inactive : ''}`}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div
          className={`${styles.emoji} ${inactive ? styles.emojiInactive : ''}`}
        >
          {item.emoji}
        </div>
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.quantity}>{item.quantity}개</span>
          </div>
          <p className={styles.location}>{breadcrumb}</p>
        </div>
      </div>
    </div>
  );
}
