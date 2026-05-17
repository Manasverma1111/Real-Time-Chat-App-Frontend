import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private api: ApiService) {}

  registerUser(payload: any) {
    return this.api.post('/auth/register', {
      email: payload.email,
      password: payload.password,
      username: payload.username,
      fullName: payload.fullName,
    });
  }

  loginUser(payload: any) {
    return this.api.post('/auth/login', payload);
  }

  getGoogleLoginUrl(): string {
    return `http://localhost:8087/oauth2/authorization/google`;
  }

  logout() {
    return this.api.post('/auth/logout', {});
  }

  /*
   NEW:
   Search users for adding members while creating room
  */
  searchUsers(keyword: string) {
    return this.api.get(`/auth/search?keyword=${keyword}`);
  }

  /*
   PRESENCE SERVICE
  */

  markUserOnline(userId: string) {
    return this.api.post(`/presence/online/${userId}`, {});
  }

  markUserOffline(userId: string) {
    return this.api.post(`/presence/offline/${userId}`, {});
  }

  getCurrentUser() {
    return this.api.get('/auth/me');
  }

  updateProfile(payload: any) {
    return this.api.put('/auth/profile', payload);
  }

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
