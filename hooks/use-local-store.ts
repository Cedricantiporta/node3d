"use client";

import * as React from "react";

import {
  readStorage,
  writeStorage,
  type Migration,
  type StorageKey,
  type WriteResult,
} from "@/lib/storage";

type Updater<T> = T | ((prev: T) => T);

/**
 * Generic localStorage-backed state. `hydrated` flips true after the first
 * client-side read, so SSR-rendered markup never mismatches stored data.
 */
export function useLocalStore<T>(
  key: StorageKey,
  defaultValue: T,
  migrate?: Migration<T>
): [T, (updater: Updater<T>) => WriteResult, { hydrated: boolean }] {
  const [hydrated, setHydrated] = React.useState(false);
  const [value, setValue] = React.useState<T>(defaultValue);

  React.useEffect(() => {
    // Reading localStorage can only happen client-side, after the SSR-matched
    // first paint, so syncing state here (rather than during render) is required.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(readStorage(key, defaultValue, migrate));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = React.useCallback(
    (updater: Updater<T>): WriteResult => {
      const next =
        typeof updater === "function" ? (updater as (prev: T) => T)(value) : updater;
      const result = writeStorage(key, next);
      setValue(next);
      return result;
    },
    [key, value]
  );

  return [value, update, { hydrated }];
}
