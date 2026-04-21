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
}
