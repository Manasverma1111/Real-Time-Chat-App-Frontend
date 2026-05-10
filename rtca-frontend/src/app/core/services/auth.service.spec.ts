import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { ApiService } from '../api/api.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const BASE_URL = 'http://localhost:8087';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create auth service', () => {
    expect(service).toBeTruthy();
  });

  it('should register user', () => {
    const payload = {
      email: 'test@gmail.com',
      password: '123456',
      username: 'manas',
      fullName: 'Manas Verma',
    };

    service.registerUser(payload).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/register`);

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual(payload);

    req.flush({
      success: true,
    });
  });

  it('should login user', () => {
    const payload = {
      email: 'test@gmail.com',
      password: '123456',
    };

    service.loginUser(payload).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/login`);

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual(payload);

    req.flush({
      token: 'jwt-token',
    });
  });

  it('should logout user', () => {
    service.logout().subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/logout`);

    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
    });
  });

  it('should search users', () => {
    const keyword = 'john';

    service.searchUsers(keyword).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/search?keyword=john`);

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should mark user online', () => {
    const userId = '123';

    service.markUserOnline(userId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/presence/online/123`);

    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
    });
  });

  it('should mark user offline', () => {
    const userId = '123';

    service.markUserOffline(userId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/presence/offline/123`);

    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
    });
  });

  it('should get current user', () => {
    service.getCurrentUser().subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/me`);

    expect(req.request.method).toBe('GET');

    req.flush({
      id: '1',
    });
  });

  it('should update profile', () => {
    const payload = {
      fullName: 'Updated User',
    };

    service.updateProfile(payload).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/profile`);

    expect(req.request.method).toBe('PUT');

    expect(req.request.body).toEqual(payload);

    req.flush({
      success: true,
    });
  });

  it('should upload profile image', () => {
    const file = new File(['dummy'], 'profile.png', {
      type: 'image/png',
    });

    const userId = '123';

    service.uploadProfileImage(file, userId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/media/upload/profile`);

    expect(req.request.method).toBe('POST');

    expect(req.request.body instanceof FormData).toBe(true);

    req.flush({
      success: true,
    });
  });
});
