import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Generic API hook
export function useApi<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error?.message || 'API request failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      console.error('API request failed:', error);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Tenants hook
export function useTenants(filters?: {
  search?: string;
  status?: string;
  buildingId?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.buildingId) queryParams.append('buildingId', filters.buildingId);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/tenants${queryString ? `?${queryString}` : ''}`;

  return useApi(url);
}

// Units hook
export function useUnits(filters?: {
  search?: string;
  buildingId?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.buildingId) queryParams.append('buildingId', filters.buildingId);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/units${queryString ? `?${queryString}` : ''}`;

  return useApi(url);
}

// Payments hook
export function usePayments(filters?: {
  search?: string;
  tenantId?: string;
  status?: string;
  paymentType?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.tenantId) queryParams.append('tenantId', filters.tenantId);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.paymentType) queryParams.append('paymentType', filters.paymentType);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/payments${queryString ? `?${queryString}` : ''}`;

  return useApi(url);
}

// Maintenance requests hook
export function useMaintenance(filters?: {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.priority) queryParams.append('priority', filters.priority);
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());

  const queryString = queryParams.toString();
  const url = `/api/maintenance${queryString ? `?${queryString}` : ''}`;

  return useApi(url);
}

// Dashboard stats hook
export function useDashboardStats(filters?: {
  buildingId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.buildingId) queryParams.append('buildingId', filters.buildingId);
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);

  const queryString = queryParams.toString();
  const url = `/api/dashboard/stats${queryString ? `?${queryString}` : ''}`;

  return useApi(url);
}

// Mutation hook for POST/PUT/DELETE operations
export function useMutation<TData = any, TVariables = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (
    url: string,
    variables: TVariables,
    options?: {
      method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      onSuccess?: (data: TData) => void;
      onError?: (error: string) => void;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);

      const method = options?.method || 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        options?.onSuccess?.(result.data);
        toast.success(result.message || 'Operation completed successfully');
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Mutation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error, data };
}

// Optimistic updates hook
export function useOptimisticUpdate<T extends { id: string }>(
  initialData: T[],
  setData: (data: T[]) => void
) {
  const updateOptimistically = useCallback((
    id: string,
    updateFn: (item: T) => T
  ) => {
    setData(prevData =>
      prevData.map(item =>
        item.id === id ? updateFn(item) : item
      )
    );
  }, [setData]);

  const rollback = useCallback((originalData: T[]) => {
    setData(originalData);
  }, [setData]);

  return { updateOptimistically, rollback };
}

// Infinite scroll hook
export function useInfiniteScroll<T>(
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  initialPage: number = 1
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const result = await fetchMore(page);

      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more data:', error);
      toast.error('Failed to load more data');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  return { data, loading, hasMore, loadMore, reset };
}

// Real-time updates hook (placeholder for WebSocket integration)
export function useRealtimeUpdates<T>(
  url: string,
  eventType: string,
  onUpdate: (data: T) => void
) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // TODO: Implement WebSocket connection
    // const ws = new WebSocket(url);

    // ws.onopen = () => setIsConnected(true);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === eventType) {
    //     onUpdate(data.payload);
    //   }
    // };

    // return () => ws.close();

    // For now, just set as connected
    setIsConnected(true);
  }, [url, eventType, onUpdate]);

  return { isConnected };
}