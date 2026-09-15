import { useQuery } from '@tanstack/react-query';
import { get } from '../services/apiClient';
import { QUERY_KEYS } from '../Constants/Constants';

/**
 * Backend build information: GET /api/v1/version/ → { version, status, date }.
 *
 * The value cannot change while the app is open (it is baked into the
 * backend's version.py), so it is fetched once and never considered stale.
 * No React Query retries either: an older backend without the endpoint
 * answers 404 on every attempt, and the strip should say "unavailable"
 * right away instead of after three back-offs. Network hiccups are still
 * retried inside apiClient.
 */
export function useAppVersion() {
  return useQuery({
    queryKey: QUERY_KEYS.appVersion,
    queryFn: async () => {
      const { data } = await get('/version/');
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
  });
}
