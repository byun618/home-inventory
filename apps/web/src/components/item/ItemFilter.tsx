'use client';

import styles from './ItemFilter.module.css';

interface ItemFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showInactiveOnly: boolean;
  onToggleSwitch: () => void;
  spaces: string[];
  activeSpace: string | null;
  onSpaceSelect: (space: string | null) => void;
}

export function ItemFilter({
  searchQuery,
  onSearchChange,
  showInactiveOnly,
  onToggleSwitch,
  spaces,
  activeSpace,
  onSpaceSelect,
}: ItemFilterProps) {
  return (
    <div className={styles.container}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="뭐 있더라?"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <label className={styles.switchRow}>
        <span className={styles.switchLabel}>사야 할 것만 보기</span>
        <input
          type="checkbox"
          className={styles.switchInput}
          checked={showInactiveOnly}
          onChange={onToggleSwitch}
        />
        <span
          className={`${styles.switch} ${showInactiveOnly ? styles.switchOn : ''}`}
        >
          <span className={styles.switchKnob} />
        </span>
      </label>

      {spaces.length > 0 && (
        <div className={styles.chips}>
          {spaces.map((space) => (
            <button
              key={space}
              className={`${styles.chip} ${activeSpace === space ? styles.chipActive : ''}`}
              onClick={() =>
                onSpaceSelect(activeSpace === space ? null : space)
              }
            >
              {space}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
