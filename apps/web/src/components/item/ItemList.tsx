'use client';

import type { Item } from '@home-inventory/shared-types';
import { ItemRow } from './ItemRow';
import styles from './ItemList.module.css';

interface ItemListProps {
  items: Item[];
  onTap: (item: Item) => void;
  onDelete: (id: string) => void;
}

export function ItemList({ items, onTap, onDelete }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyIcon}>📦</p>
        <p className={styles.emptyText}>아직 등록한 물건이 없어요</p>
        <p className={styles.emptyHint}>+ 버튼을 눌러 추가해보세요</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          onTap={onTap}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
