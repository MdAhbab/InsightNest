import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSavedItems, createSavedItem, deleteSavedItem } from "../api/catalog";
import { SavedItem, SavedItemType } from "../types";

type UseSavedItemsDisabled = {
  enabled: false;
  isSaved: (itemId: number) => false;
  toggle: (itemId: number) => Promise<void>;
  busyId: null;
};

type UseSavedItemsEnabled = {
  enabled: true;
  isSaved: (itemId: number) => boolean;
  toggle: (itemId: number) => Promise<void>;
  busyId: number | null;
};

type UseSavedItemsResult = UseSavedItemsDisabled | UseSavedItemsEnabled;

const useSavedItems = (itemType: SavedItemType): UseSavedItemsResult => {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    getSavedItems()
      .then((all) => {
        if (!mountedRef.current) return;
        setItems(all.filter((s) => s.itemType === itemType));
      })
      .catch(() => {
        // silently ignore load failure
      });
  }, [user, itemType]);

  const isSaved = useCallback(
    (itemId: number): boolean => items.some((s) => s.itemId === itemId),
    [items]
  );

  const toggle = useCallback(
    async (itemId: number): Promise<void> => {
      if (!user) return;
      const existing = items.find((s) => s.itemId === itemId);
      setBusyId(itemId);
      if (existing) {
        // Optimistic remove
        setItems((prev) => prev.filter((s) => s.id !== existing.id));
        try {
          await deleteSavedItem(existing.id);
        } catch {
          // Revert on failure
          if (mountedRef.current) {
            setItems((prev) => [...prev, existing]);
          }
        }
      } else {
        // Optimistic add — use a temporary object until server responds
        const optimistic: SavedItem = { id: -itemId, itemType, itemId, createdAt: new Date().toISOString() };
        setItems((prev) => [...prev, optimistic]);
        try {
          const created = await createSavedItem({ itemType, itemId });
          if (mountedRef.current) {
            setItems((prev) => prev.map((s) => (s.id === optimistic.id ? created : s)));
          }
        } catch {
          // Revert on failure
          if (mountedRef.current) {
            setItems((prev) => prev.filter((s) => s.id !== optimistic.id));
          }
        }
      }
      if (mountedRef.current) {
        setBusyId(null);
      }
    },
    [user, items, itemType]
  );

  if (!user) {
    return {
      enabled: false,
      isSaved: () => false,
      toggle: async () => {},
      busyId: null,
    };
  }

  return {
    enabled: true,
    isSaved,
    toggle,
    busyId,
  };
};

export default useSavedItems;
