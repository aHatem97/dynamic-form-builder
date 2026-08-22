const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json() as Promise<T>;
}
