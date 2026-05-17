// AUTH UTILITIES: these functions are used to manage authentication tokens and user information in session storage.
// They provide a simple interface for other parts of the application to set, get, 
// and clear authentication data without needing to directly interact with session storage.
export function getToken() {
  return sessionStorage.getItem('connecthub_token');
}

// UTILITY FUNCTION TO SET TOKEN: this can be called after a successful login to store the JWT token in session storage, 
// which will then be used for authenticated API requests and WebSocket connections.
export function setToken(token: string) {
  sessionStorage.setItem('connecthub_token', token);
}

// UTILITY FUNCTION TO CLEAR TOKEN: this can be called when the user logs out to remove the JWT token from session storage, 
// ensuring that the user is effectively logged out and cannot make authenticated requests until they log in again.
export function clearToken() {
  sessionStorage.removeItem('connecthub_token');
}

// UTILITY FUNCTION TO FETCH CURRENT USER: 
// this can be called after a successful login to fetch the user's information from the backend and store it in session storage using setUser(). 
// This way, the application has access to the user's details (like username, email, role, etc.) without needing to make an API call every time.
export async function fetchCurrentUser() {
  const token = getToken();

  if (!token) throw new Error('No token found');

  // Make an authenticated request to the /auth/me endpoint to get the current user's information.
  const response = await fetch('http://localhost:8087/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  // if the response is not ok, throw an error with the message from the response or a default message
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user');
  }

  return data;
}

// UTILITY FUNCTION TO SET USER DATA: 
// this can be called after a successful login to store the user's information in session storage,
// which can then be accessed throughout the application without needing to make an API call every time.
export function setUser(user: any) {
  sessionStorage.setItem('connecthub_user', JSON.stringify(user));
}

// UTILITY FUNCTION TO GET USER DATA: 
// this can be used throughout the application to access the current user's information (like username, email, role, etc.) 
// without having to make an API call every time, since the user data is stored in session storage after login.
export function getUser() {
  const data = sessionStorage.getItem('connecthub_user');
  return data ? JSON.parse(data) : null;
}

// UTILITY FUNCTION TO CLEAR USER DATA: 
// this can be called when the user logs out to remove the user information from session storage.
export function clearUser() {
  sessionStorage.removeItem('connecthub_user');
}

// UTILITY FUNCTION TO GET USER ROLE: 
// this can be used to easily access the user's role throughout the application 
// without having to parse the user object every time.
export function getUserRole(): string | null {
  const user = getUser();
  return user?.role || null;
}

// UTILITY FUNCTION TO CHECK IF USER IS SUPER_ADMIN: 
// this can be used throughout the application to conditionally render admin-only features 
// or restrict access to certain routes based on the user's role.
export function isSuperAdmin(): boolean {
  return getUserRole() === 'SUPER_ADMIN';
}
