'use client';

import type { Item } from '@home-inventory/shared-types';
import styles from './DeleteDialog.module.css';

interface DeleteDialogProps {
  item: Item;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({ item, onConfirm, onCancel }: DeleteDialogProps) {
  const breadcrumb = [item.space, item.zone, ...item.details]
    .filter(Boolean)
    .join(' > ');

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.itemInfo}>
          <span className={styles.emoji}>{item.emoji}</span>
          <div>
            <p className={styles.name}>{item.name}</p>
            <p className={styles.location}>{breadcrumb}</p>
          </div>
        </div>
        <p className={styles.message}>더 이상 안 쓰는 물건인가요?</p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            아니요
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            더 이상 안 써요
          </button>
        </div>
      </div>
    </div>
  );
}
