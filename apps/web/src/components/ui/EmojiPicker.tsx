'use client';

import { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import styles from './EmojiPicker.module.css';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.container}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className={styles.emoji}>{value}</span>
        <span className={styles.hint}>탭해서 변경</span>
      </button>

      {open && (
        <div className={styles.pickerWrapper}>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={styles.picker}>
            <Picker
              data={data}
              onEmojiSelect={(emoji: { native: string }) => {
                onChange(emoji.native);
                setOpen(false);
              }}
              locale="kr"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
