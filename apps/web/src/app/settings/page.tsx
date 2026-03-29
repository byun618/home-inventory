'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import styles from './page.module.css';

interface LocationNode {
  name: string;
  children: LocationNode[];
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [spaces, setSpaces] = useState<LocationNode[]>([]);
  const [expandedSpace, setExpandedSpace] = useState<string | null>(null);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);

  // Inline editing
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Inline adding
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addValue, setAddValue] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) loadSpaces();
  }, [authLoading, user, router]);

  const loadSpaces = async () => {
    try {
      const spaceNames = await api.get<string[]>('/locations/spaces');
      const nodes: LocationNode[] = await Promise.all(
        spaceNames.map(async (spaceName) => {
          const zoneNames = await api.get<string[]>(
            `/locations/zones?space=${encodeURIComponent(spaceName)}`,
          );
          const children = await Promise.all(
            zoneNames.map(async (zoneName) => {
              const detailNames = await api.get<string[]>(
                `/locations/details?space=${encodeURIComponent(spaceName)}&zone=${encodeURIComponent(zoneName)}`,
              );
              return {
                name: zoneName,
                children: detailNames.map((d) => ({ name: d, children: [] })),
              };
            }),
          );
          return { name: spaceName, children };
        }),
      );
      setSpaces(nodes);
    } catch {
      // ignore
    }
  };

  const handleRename = async (
    level: 'spaces' | 'zones' | 'details',
    oldName: string,
    newName: string,
    query?: string,
  ) => {
    if (!newName.trim() || newName === oldName) {
      setEditingItem(null);
      return;
    }
    try {
      await api.patch(`/locations/${level}/${encodeURIComponent(oldName)}${query || ''}`, {
        newName: newName.trim(),
      });
      await loadSpaces();
    } catch {
      // ignore
    }
    setEditingItem(null);
  };

  const handleDelete = async (
    level: 'spaces' | 'zones' | 'details',
    name: string,
    query?: string,
  ) => {
    try {
      await api.delete(
        `/locations/${level}/${encodeURIComponent(name)}${query || ''}`,
      );
      await loadSpaces();
    } catch {
      // ignore
    }
  };

  const handleRenamePut = async (
    level: 'spaces' | 'zones' | 'details',
    oldName: string,
    newName: string,
    query?: string,
  ) => {
    if (!newName.trim() || newName === oldName) {
      setEditingItem(null);
      return;
    }
    try {
      await api.put(
        `/locations/${level}/${encodeURIComponent(oldName)}${query || ''}`,
        { newName: newName.trim() },
      );
      await loadSpaces();
    } catch {
      // ignore
    }
    setEditingItem(null);
  };

  if (authLoading || !user) return null;

  return (
    <>
      <Header title="설정" onBackClick={() => router.back()} />

      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>위치 관리</h2>

        {spaces.length === 0 && (
          <p className={styles.emptyText}>
            물건을 추가하면 위치가 자동으로 생겨요
          </p>
        )}

        {spaces.map((space) => (
          <div key={space.name} className={styles.group}>
            <div className={styles.row}>
              <button
                className={styles.expandButton}
                onClick={() =>
                  setExpandedSpace(
                    expandedSpace === space.name ? null : space.name,
                  )
                }
              >
                {expandedSpace === space.name ? '▼' : '▶'}
              </button>

              {editingItem === `space:${space.name}` ? (
                <input
                  className={styles.editInput}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')
                      handleRenamePut('spaces', space.name, editValue);
                  }}
                  onBlur={() =>
                    handleRenamePut('spaces', space.name, editValue)
                  }
                  autoFocus
                />
              ) : (
                <span
                  className={styles.label}
                  onClick={() => {
                    setEditingItem(`space:${space.name}`);
                    setEditValue(space.name);
                  }}
                >
                  {space.name}
                </span>
              )}

              <button
                className={styles.deleteIcon}
                onClick={() => handleDelete('spaces', space.name)}
              >
                ✕
              </button>
            </div>

            {expandedSpace === space.name && (
              <div className={styles.nested}>
                {space.children.map((zone) => (
                  <div key={zone.name}>
                    <div className={styles.row}>
                      <button
                        className={styles.expandButton}
                        onClick={() =>
                          setExpandedZone(
                            expandedZone === `${space.name}:${zone.name}`
                              ? null
                              : `${space.name}:${zone.name}`,
                          )
                        }
                      >
                        {expandedZone === `${space.name}:${zone.name}`
                          ? '▼'
                          : '▶'}
                      </button>

                      {editingItem === `zone:${space.name}:${zone.name}` ? (
                        <input
                          className={styles.editInput}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter')
                              handleRenamePut(
                                'zones',
                                zone.name,
                                editValue,
                                `?space=${encodeURIComponent(space.name)}`,
                              );
                          }}
                          onBlur={() =>
                            handleRenamePut(
                              'zones',
                              zone.name,
                              editValue,
                              `?space=${encodeURIComponent(space.name)}`,
                            )
                          }
                          autoFocus
                        />
                      ) : (
                        <span
                          className={styles.label}
                          onClick={() => {
                            setEditingItem(
                              `zone:${space.name}:${zone.name}`,
                            );
                            setEditValue(zone.name);
                          }}
                        >
                          {zone.name}
                        </span>
                      )}

                      <button
                        className={styles.deleteIcon}
                        onClick={() =>
                          handleDelete(
                            'zones',
                            zone.name,
                            `?space=${encodeURIComponent(space.name)}`,
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>

                    {expandedZone === `${space.name}:${zone.name}` && (
                      <div className={styles.nested}>
                        {zone.children.map((detail) => (
                          <div key={detail.name} className={styles.row}>
                            <div className={styles.expandButton} />

                            {editingItem ===
                            `detail:${space.name}:${zone.name}:${detail.name}` ? (
                              <input
                                className={styles.editInput}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter')
                                    handleRenamePut(
                                      'details',
                                      detail.name,
                                      editValue,
                                      `?space=${encodeURIComponent(space.name)}&zone=${encodeURIComponent(zone.name)}`,
                                    );
                                }}
                                onBlur={() =>
                                  handleRenamePut(
                                    'details',
                                    detail.name,
                                    editValue,
                                    `?space=${encodeURIComponent(space.name)}&zone=${encodeURIComponent(zone.name)}`,
                                  )
                                }
                                autoFocus
                              />
                            ) : (
                              <span
                                className={styles.label}
                                onClick={() => {
                                  setEditingItem(
                                    `detail:${space.name}:${zone.name}:${detail.name}`,
                                  );
                                  setEditValue(detail.name);
                                }}
                              >
                                {detail.name}
                              </span>
                            )}

                            <button
                              className={styles.deleteIcon}
                              onClick={() =>
                                handleDelete(
                                  'details',
                                  detail.name,
                                  `?space=${encodeURIComponent(space.name)}&zone=${encodeURIComponent(zone.name)}`,
                                )
                              }
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
