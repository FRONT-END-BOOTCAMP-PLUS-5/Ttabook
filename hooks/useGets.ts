import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

export const useGets = <TData>(
  queryKey: QueryKey,
  path: string,
  enabled = true,
  params?: Record<string, string>,
  headers?: Record<string, string>,
  options?: Omit<
    UseQueryOptions<TData, AxiosError<ApiErrorResponse>, TData, QueryKey>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<TData, AxiosError<ApiErrorResponse>, TData, QueryKey>({
    queryKey: queryKey,
    queryFn: async () => {
      const response = await axios.get<TData>(
        `${process.env.NEXT_PUBLIC_BASE_URL}${path}`,
        {
          params: params,
          headers: headers,
        }
      );
      return response.data;
    },
    enabled,
    ...options,
  });
};
