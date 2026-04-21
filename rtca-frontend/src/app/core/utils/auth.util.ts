export function getToken() {
  return localStorage.getItem('connecthub_token');
}

export function setToken(token: string) {
  localStorage.setItem('connecthub_token', token);
}

export function clearToken() {
  localStorage.removeItem('connecthub_token');
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
