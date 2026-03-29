'use client';

import { useState, useEffect } from 'react';
import type { Item } from '@home-inventory/shared-types';
import { api } from '@/lib/api';
import styles from './AddItemModal.module.css';

interface EditItemModalProps {
  item: Item | null;
  onClose: () => void;
  onUpdated: () => void;
  onDelete: (id: string) => void;
}

export function EditItemModal({
  item,
  onClose,
  onUpdated,
  onDelete,
}: EditItemModalProps) {
  const [emoji, setEmoji] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [space, setSpace] = useState('');
  const [zone, setZone] = useState('');
  const [details, setDetails] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [spaces, setSpaces] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [detailOptions, setDetailOptions] = useState<string[]>([]);

  const [newSpace, setNewSpace] = useState('');
  const [newZone, setNewZone] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [showNewSpace, setShowNewSpace] = useState(false);
  const [showNewZone, setShowNewZone] = useState(false);
  const [showNewDetail, setShowNewDetail] = useState(false);

  useEffect(() => {
    if (item) {
      setEmoji(item.emoji);
      setName(item.name);
      setQuantity(item.quantity);
      setSpace(item.space);
      setZone(item.zone ?? '');
      setDetails([...item.details]);
      setError('');
      api.get<string[]>('/locations/spaces').then(setSpaces).catch(() => {});
    }
  }, [item]);

  useEffect(() => {
    if (space) {
      api
        .get<string[]>(`/locations/zones?space=${encodeURIComponent(space)}`)
        .then(setZones)
        .catch(() => {});
    } else {
      setZones([]);
    }
  }, [space]);

  useEffect(() => {
    if (space && zone) {
      api
        .get<string[]>(
          `/locations/details?space=${encodeURIComponent(space)}&zone=${encodeURIComponent(zone)}`,
        )
        .then(setDetailOptions)
        .catch(() => {});
    } else {
      setDetailOptions([]);
    }
  }, [space, zone]);

  const handleSubmit = async () => {
    if (!item) return;
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    // Build diff
    const diff: Record<string, unknown> = {};
    if (emoji !== item.emoji) diff.emoji = emoji;
    if (name.trim() !== item.name) diff.name = name.trim();
    if (quantity !== item.quantity) diff.quantity = quantity;
    if (space !== item.space) diff.space = space;
    if (zone !== (item.zone ?? '')) diff.zone = zone || undefined;
    if (JSON.stringify(details) !== JSON.stringify(item.details))
      diff.details = details;

    if (Object.keys(diff).length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/items/${item.id}`, diff);
      onUpdated();
      onClose();
    } catch {
      setError('저장에 실패했어요');
    } finally {
      setLoading(false);
    }
  };

  const addNewSpace = () => {
    if (newSpace.trim()) {
      const val = newSpace.trim();
      if (!spaces.includes(val)) setSpaces([...spaces, val]);
      setSpace(val);
      setNewSpace('');
      setShowNewSpace(false);
    }
  };

  const addNewZone = () => {
    if (newZone.trim()) {
      const val = newZone.trim();
      if (!zones.includes(val)) setZones([...zones, val]);
      setZone(val);
      setNewZone('');
      setShowNewZone(false);
    }
  };

  const addNewDetail = () => {
    if (newDetail.trim()) {
      const val = newDetail.trim();
      if (!detailOptions.includes(val))
        setDetailOptions([...detailOptions, val]);
      if (!details.includes(val)) setDetails([...details, val]);
      setNewDetail('');
      setShowNewDetail(false);
    }
  };

  const toggleDetail = (d: string) => {
    setDetails((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  if (!item) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{item.name}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <button
            className={styles.emojiPicker}
            onClick={() => {
              const emojis = [
                '📦', '🧴', '🧹', '🍚', '🥚', '🧻', '🧼', '🥛', '☕',
                '🍜', '🫙', '🧈', '💊', '🪥', '🧽',
              ];
              const idx = emojis.indexOf(emoji);
              setEmoji(emojis[(idx + 1) % emojis.length]);
            }}
          >
            <span className={styles.emojiDisplay}>{emoji}</span>
            <span className={styles.emojiHint}>탭해서 변경</span>
          </button>

          <input
            className={styles.input}
            placeholder="물건 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className={styles.section}>
            <p className={styles.sectionLabel}>개수</p>
            <div className={styles.stepper}>
              <button
                className={styles.stepperButton}
                onClick={() => setQuantity(Math.max(0, quantity - 1))}
              >
                −
              </button>
              <span className={styles.stepperValue}>{quantity}</span>
              <button
                className={styles.stepperButton}
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Space */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>공간</p>
            <div className={styles.chips}>
              {spaces.map((s) => (
                <button
                  key={s}
                  className={`${styles.chip} ${space === s ? styles.chipActive : ''}`}
                  onClick={() => setSpace(space === s ? '' : s)}
                >
                  {s}
                </button>
              ))}
              {showNewSpace ? (
                <input
                  className={styles.chipInput}
                  placeholder="공간 이름"
                  value={newSpace}
                  onChange={(e) => setNewSpace(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNewSpace()}
                  onBlur={addNewSpace}
                  autoFocus
                />
              ) : (
                <button
                  className={styles.chipAdd}
                  onClick={() => setShowNewSpace(true)}
                >
                  + 추가
                </button>
              )}
            </div>
          </div>

          {/* Zone */}
          {space && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>구역</p>
              <div className={styles.chips}>
                {zones.map((z) => (
                  <button
                    key={z}
                    className={`${styles.chip} ${zone === z ? styles.chipActive : ''}`}
                    onClick={() => setZone(zone === z ? '' : z)}
                  >
                    {z}
                  </button>
                ))}
                {showNewZone ? (
                  <input
                    className={styles.chipInput}
                    placeholder="구역 이름"
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNewZone()}
                    onBlur={addNewZone}
                    autoFocus
                  />
                ) : (
                  <button
                    className={styles.chipAdd}
                    onClick={() => setShowNewZone(true)}
                  >
                    + 추가
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Details */}
          {zone && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>세부위치</p>
              <div className={styles.chips}>
                {detailOptions.map((d) => (
                  <button
                    key={d}
                    className={`${styles.chip} ${details.includes(d) ? styles.chipActive : ''}`}
                    onClick={() => toggleDetail(d)}
                  >
                    {d}
                  </button>
                ))}
                {showNewDetail ? (
                  <input
                    className={styles.chipInput}
                    placeholder="세부위치"
                    value={newDetail}
                    onChange={(e) => setNewDetail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNewDetail()}
                    onBlur={addNewDetail}
                    autoFocus
                  />
                ) : (
                  <button
                    className={styles.chipAdd}
                    onClick={() => setShowNewDetail(true)}
                  >
                    + 추가
                  </button>
                )}
              </div>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => {
              onDelete(item.id);
              onClose();
            }}
          >
            더 이상 안 써요
          </button>
        </div>
      </div>
    </div>
  );
}
