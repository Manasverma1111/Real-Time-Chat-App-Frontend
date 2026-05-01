export function getToken() {
  return sessionStorage.getItem('connecthub_token');
}

export function setToken(token: string) {
  sessionStorage.setItem('connecthub_token', token);
}

export function clearToken() {
  sessionStorage.removeItem('connecthub_token');
}

export async function fetchCurrentUser() {
  const token = getToken();

  if (!token) throw new Error('No token found');

  const response = await fetch('http://localhost:8087/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user');
  }

  return data;
}

export function setUser(user: any) {
  sessionStorage.setItem('connecthub_user', JSON.stringify(user));
}

export function getUser() {
  const data = sessionStorage.getItem('connecthub_user');
  return data ? JSON.parse(data) : null;
}

export function clearUser() {
  sessionStorage.removeItem('connecthub_user');
}

export function getUserRole(): string | null {
  const user = getUser();
  return user?.role || null;
}

export function isSuperAdmin(): boolean {
  return getUserRole() === 'SUPER_ADMIN';
}
