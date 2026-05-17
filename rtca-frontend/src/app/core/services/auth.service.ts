import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private api: ApiService) {}

  // AUTHENTICATION APIs
  registerUser(payload: any) {
    return this.api.post('/auth/register', {
      email: payload.email,
      password: payload.password,
      username: payload.username,
      fullName: payload.fullName,
    });
  }

  // LOGIN API: expects { email, password } and returns { token }
  loginUser(payload: any) {
    return this.api.post('/auth/login', payload);
  }

  // Since Google login is handled via redirection, this method just returns the URL to redirect to
  getGoogleLoginUrl(): string {
    return `http://localhost:8087/oauth2/authorization/google`;
  }

  // LOGOUT API: simply calls the logout endpoint to invalidate the session on the server
  logout() {
    return this.api.post('/auth/logout', {});
  }

  /*
   NEW:
   Search users for adding members while creating room
  */
//  Note: this is a simple search by keyword (name or email) and returns a list of matching users
  searchUsers(keyword: string) {
    return this.api.get(`/auth/search?keyword=${keyword}`);
  }

  /*
   PRESENCE SERVICE
  */
// These APIs are called by PresenceService to update user presence status in real-time
  markUserOnline(userId: string) {
    return this.api.post(`/presence/online/${userId}`, {});
  }

  // Added markUserOffline() for completeness, although in a real app this might be handled by the server when the WebSocket disconnects
  markUserOffline(userId: string) {
    return this.api.post(`/presence/offline/${userId}`, {});
  }

  // GET CURRENT USER API: returns the details of the currently authenticated user based on the token in the session storage
  getCurrentUser() {
    return this.api.get('/auth/me');
  }

  // UPDATE PROFILE API: allows the user to update their profile information like full name, username, etc.
  updateProfile(payload: any) {
    return this.api.put('/auth/profile', payload);
  }

  // UPLOAD PROFILE IMAGE API: allows the user to upload a new profile picture. 
  // Expects a FormData object with the file and userId.
  uploadProfileImage(file: File, userId: string) {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', file);

    return this.api.post('/media/upload/profile', formData);
  }

  /*
   FETCH ANY USER'S PUBLIC PROFILE BY ID
   Used by members modal to show user details
   Maps to: GET /auth/user/{userId}
  */
  getUserById(userId: string) {
    return this.api.get(`/auth/user/${userId}`);
  }
}
