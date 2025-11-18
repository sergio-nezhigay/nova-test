'use client';

import { useState, useEffect } from 'react';
import type { Warehouse } from '@/types/nova-poshta';
import type { WarehousesApiResponse } from '@/types/api';

export function useWarehouses(cityRef: string | null) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityRef) {
      setWarehouses([]);
      setError(null);
      return;
    }

    const fetchWarehouses = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/nova-poshta/warehouses?cityRef=${encodeURIComponent(cityRef)}`
        );

        if (!response.ok) {
          throw new Error('Не вдалося завантажити відділення');
        }

        const data: WarehousesApiResponse = await response.json();

        if (data.success) {
          setWarehouses(data.data);
        } else {
          setError(data.error || 'Помилка завантаження відділень');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка з'єднання");
        setWarehouses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [cityRef]);

  return { warehouses, loading, error };
}
