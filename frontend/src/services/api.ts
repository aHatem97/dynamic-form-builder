const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface ApiErrorResponse {
  message?: string;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const isFormData = options?.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = "Something went wrong";

    try {
      const errorData = (await response.json()) as ApiErrorResponse;

      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Ignore non-JSON error responses.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
