'use client';

import { useState, useEffect, useRef } from 'react';
import type { Warehouse } from '@/types/nova-poshta';
import type { WarehousesApiResponse } from '@/types/api';

export function useWarehouses(cityRef: string | null) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, Warehouse[]>>(new Map());

  useEffect(() => {
    if (!cityRef) {
      setWarehouses([]);
      setError(null);
      setLoading(false);
      return;
    }

    const cache = cacheRef.current;
    const cachedWarehouses = cache.get(cityRef);

    if (cachedWarehouses) {
      setWarehouses(cachedWarehouses);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchWarehouses = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/nova-poshta/warehouses?cityRef=${encodeURIComponent(cityRef)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Не вдалося завантажити відділення');
        }

        const data: WarehousesApiResponse = await response.json();

        if (data.success) {
          setWarehouses(data.data);
          cache.set(cityRef, data.data);
        } else {
          setError(data.error || 'Помилка завантаження відділень');
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : "Помилка з'єднання");
        setWarehouses([]);
      } finally {
        if (controller.signal.aborted) {
          return;
        }
        setLoading(false);
      }
    };

    fetchWarehouses();

    return () => {
      controller.abort();
    };
  }, [cityRef]);

  return { warehouses, loading, error };
}
