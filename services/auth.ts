const API_URL = 'http://localhost:4000';

export interface User {
  id: number;
  username: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthError {
  error: string;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function setToken(token: string): void {
  localStorage.setItem('token', token);
}

function clearToken(): void {
  localStorage.removeItem('token');
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const text = await res.text();
    if (!text) {
      throw new Error('Server returned empty response. Make sure the backend is running.');
    }
    
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setToken(data.token);
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure the backend is running on port 4000.');
    }
    throw error;
  }
}

export async function register(
  username: string,
  password: string,
  name: string,
  securityCode: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, name, securityCode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  setToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  clearToken();
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearToken();
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
