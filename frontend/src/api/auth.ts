export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface ApiResponse {
  message: string;
}

/**
 * Calls POST /api/auth/register.
 * Throws an Error with the backend message on non-2xx responses.
 */
export async function registerUser(payload: RegisterPayload): Promise<string> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data: ApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Registration failed. Please try again.");
  }

  return data.message;
}
