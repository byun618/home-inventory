'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import styles from './AddItemModal.module.css';

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddItemModal({ open, onClose, onCreated }: AddItemModalProps) {
  const [emoji, setEmoji] = useState('📦');
  const [name, setName] = useState('');
  const [space, setSpace] = useState('');
  const [zone, setZone] = useState('');
  const [details, setDetails] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Location data
  const [spaces, setSpaces] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [detailOptions, setDetailOptions] = useState<string[]>([]);

  // Inline add
  const [newSpace, setNewSpace] = useState('');
  const [newZone, setNewZone] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [showNewSpace, setShowNewSpace] = useState(false);
  const [showNewZone, setShowNewZone] = useState(false);
  const [showNewDetail, setShowNewDetail] = useState(false);

  useEffect(() => {
    if (open) {
      api.get<string[]>('/locations/spaces').then(setSpaces).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (space) {
      api
        .get<string[]>(`/locations/zones?space=${encodeURIComponent(space)}`)
        .then(setZones)
        .catch(() => {});
    } else {
      setZones([]);
    }
    setZone('');
    setDetails([]);
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
    setDetails([]);
  }, [space, zone]);

  const reset = () => {
    setEmoji('📦');
    setName('');
    setSpace('');
    setZone('');
    setDetails([]);
    setError('');
    setNewSpace('');
    setNewZone('');
    setNewDetail('');
    setShowNewSpace(false);
    setShowNewZone(false);
    setShowNewDetail(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    if (!space) {
      setError('위치를 선택해주세요');
      return;
    }

    setLoading(true);
    try {
      await api.post('/items', {
        emoji,
        name: name.trim(),
        space,
        zone: zone || undefined,
        details: details.length > 0 ? details : undefined,
      });
      reset();
      onCreated();
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
      if (!detailOptions.includes(val)) setDetailOptions([...detailOptions, val]);
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

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>새로 추가</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {/* Emoji */}
          <button
            className={styles.emojiPicker}
            onClick={() => {
              const emojis = ['📦', '🧴', '🧹', '🍚', '🥚', '🧻', '🧼', '🥛', '☕', '🍜', '🫙', '🧈', '💊', '🪥', '🧽'];
              const idx = emojis.indexOf(emoji);
              setEmoji(emojis[(idx + 1) % emojis.length]);
            }}
          >
            <span className={styles.emojiDisplay}>{emoji}</span>
            <span className={styles.emojiHint}>탭해서 변경</span>
          </button>

          {/* Name */}
          <input
            className={styles.input}
            placeholder="물건 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Space (1단계) */}
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

          {/* Zone (2단계) */}
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

          {/* Details (3단계) */}
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

        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
