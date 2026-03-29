'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Item } from '@home-inventory/shared-types';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { Header } from '@/components/layout/Header';
import { SideDrawer } from '@/components/layout/SideDrawer';
import { FAB } from '@/components/layout/FAB';
import { ItemFilter } from '@/components/item/ItemFilter';
import { ItemList } from '@/components/item/ItemList';
import { DeleteDialog } from '@/components/item/DeleteDialog';
import { AddItemModal } from '@/components/item/AddItemModal';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [spaces, setSpaces] = useState<string[]>([]);
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const fetchItems = useCallback(async () => {
    try {
      const data = await api.get<Item[]>('/items');
      setItems(data);

      const uniqueSpaces = [...new Set(data.map((item) => item.space))];
      setSpaces(uniqueSpaces);
      setLoaded(true);
    } catch {
      // handled by api client
    }
  }, []);

  useEffect(() => {
    if (user) fetchItems();
  }, [user, fetchItems]);

  // WebSocket
  useEffect(() => {
    if (!user) return;

    try {
      const socket = connectSocket();

      socket.on('item:created', (data: Item & { _senderId: string }) => {
        if (data._senderId === user.id) return;
        setItems((prev) => [data, ...prev]);
      });

      socket.on(
        'item:toggled',
        (data: { id: string; active: boolean; _senderId: string }) => {
          if (data._senderId === user.id) return;
          setItems((prev) =>
            prev.map((item) =>
              item.id === data.id ? { ...item, active: data.active } : item,
            ),
          );
        },
      );

      socket.on('item:deleted', (data: { id: string; _senderId: string }) => {
        if (data._senderId === user.id) return;
        setItems((prev) => prev.filter((item) => item.id !== data.id));
      });

      return () => {
        disconnectSocket();
      };
    } catch {
      // no token yet
    }
  }, [user]);

  const handleToggle = async (id: string) => {
    try {
      const result = await api.patch<{ id: string; active: boolean }>(
        `/items/${id}/toggle`,
      );
      setItems((prev) =>
        prev.map((item) =>
          item.id === result.id ? { ...item, active: result.active } : item,
        ),
      );
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/items/${deleteTarget.id}`);
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    } catch {
      // ignore
    }
    setDeleteTarget(null);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (showInactiveOnly && item.active) return false;
    if (activeSpace && item.space !== activeSpace) return false;
    return true;
  });

  if (authLoading || !user) return null;

  return (
    <>
      <Header title="우리집" onMenuClick={() => setDrawerOpen(true)} />
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <ItemFilter
        showInactiveOnly={showInactiveOnly}
        onToggleSwitch={() => setShowInactiveOnly(!showInactiveOnly)}
        spaces={spaces}
        activeSpace={activeSpace}
        onSpaceSelect={setActiveSpace}
      />

      {loaded && (
        <ItemList
          items={filteredItems}
          onToggle={handleToggle}
          onDelete={(id) => {
            const item = items.find((i) => i.id === id);
            if (item) setDeleteTarget(item);
          }}
        />
      )}

      <FAB onClick={() => setAddModalOpen(true)} />

      <AddItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={fetchItems}
      />

      {deleteTarget && (
        <DeleteDialog
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
