import {useState, useCallback} from 'react';
import {ApiResponse, ApiError} from '../services/api/apiClient';
import {useToast} from '../utils/ToastContext';

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<ApiResponse<T>>;
  reset: () => void;
}

/**
 * Custom hook for API calls with automatic loading and error handling
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {},
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const {showSuccess, showError} = useToast();

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<ApiResponse<T>> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...args);

        if (response.success && response.data) {
          setData(response.data);

          // Show success toast if enabled
          if (showSuccessToast) {
            showSuccess(
              successMessage || response.message || 'Operation successful',
            );
          }

          // Call success callback
          if (onSuccess) {
            onSuccess(response.data);
          }
        } else if (response.error) {
          setError(response.error);

          // Show error toast if enabled
          if (showErrorToast) {
            showError(response.error.message || 'An error occurred');
          }

          // Call error callback
          if (onError) {
            onError(response.error);
          }
        }

        setLoading(false);
        return response;
      } catch (err) {
        const apiError: ApiError = {
          message: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
        };

        setError(apiError);
        setLoading(false);

        if (showErrorToast) {
          showError(apiError.message);
        }

        if (onError) {
          onError(apiError);
        }

        return {
          success: false,
          error: apiError,
        };
      }
    },
    [apiFunction, showSuccessToast, showErrorToast, successMessage, onSuccess, onError, showSuccess, showError],
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Custom hook for API calls that execute immediately on mount
 */
export function useApiOnMount<T = any>(
  apiFunction: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {},
): UseApiReturn<T> {
  const api = useApi<T>(apiFunction, options);

  // Execute on mount
  React.useEffect(() => {
    api.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return api;
}

/**
 * Custom hook for mutation operations (POST, PUT, DELETE)
 */
export function useMutation<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {},
): UseApiReturn<T> {
  return useApi<T>(apiFunction, {
    showSuccessToast: true,
    showErrorToast: true,
    ...options,
  });
}

// Re-export for convenience
import React from 'react';
