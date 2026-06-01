import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { panchangService } from '@/services/panchang.service';

/**
 * Hook to retrieve daily Panchang parameters based on date, coordinates, and timezone.
 */
export function usePanchangQuery(params: {
  date: string;
  latitude: number;
  longitude: number;
  timezone: number;
}) {
  return useQuery({
    queryKey: ['panchang', params],
    queryFn: () => panchangService.getPanchang(params).then((res) => res.data.data),
    enabled: !!params.date && params.latitude !== undefined && params.longitude !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
}

/**
 * Hook to retrieve user saved favorite location configurations.
 */
export function usePanchangPreferencesQuery(enabled = true) {
  return useQuery({
    queryKey: ['panchang-preferences'],
    queryFn: () => panchangService.getPreferences().then((res) => res.data.data),
    enabled,
    retry: false,
  });
}

/**
 * Hook to save or update default coordinates, timezone, and city name defaults.
 */
export function useSavePreferencesMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { latitude: number; longitude: number; timezone: number; cityName: string }) =>
      panchangService.savePreferences(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panchang-preferences'] });
    },
  });
}

/**
 * Hook to retrieve aggregate analytics reporting. Limited to admin access.
 */
export function usePanchangAdminAnalyticsQuery() {
  return useQuery({
    queryKey: ['panchang-admin-analytics'],
    queryFn: () => panchangService.getAnalytics().then((res) => res.data.data),
  });
}
