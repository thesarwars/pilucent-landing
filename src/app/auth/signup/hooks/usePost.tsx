import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import axios, { AxiosRequestConfig } from 'axios';

type PostData = Record<string, any>; 
export function usePost<Data = any, Error = any>(
  url: string,
  config?: AxiosRequestConfig,
  options?: UseMutationOptions<Data, Error, PostData>
) {
  return useMutation<Data, Error, PostData>({
    mutationFn: async (data) => {
      const response = await axios.post(url, data, config);
      return response.data;
    },
    ...options, 
  });
}
