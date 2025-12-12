import { useMutation } from '@tanstack/react-query';
import { warrantiesApi } from '@/lib/api';

interface UseRegisterWarrantyOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRegisterWarranty(options?: UseRegisterWarrantyOptions) {
  return useMutation(
    (payload: { asset_id: string; asset_name: string; user_id: string }) =>
      warrantiesApi.registerWarranty(payload),
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );
}
