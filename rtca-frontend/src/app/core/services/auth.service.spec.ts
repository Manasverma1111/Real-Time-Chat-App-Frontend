import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { ApiService } from '../api/api.service';

// Mock ApiService to isolate AuthService tests
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const BASE_URL = 'http://localhost:8087';

  // Set up the testing module and inject the service and http mock
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, ApiService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // verify that there are no outstanding HTTP requests after each test
  afterEach(() => {
    httpMock.verify();
  });

  // basic test to check if the service is created successfully
  it('should create auth service', () => {
    expect(service).toBeTruthy();
  });

  // test for user registration API call
  it('should register user', () => {
    const payload = {
      email: 'test@gmail.com',
      password: '123456',
      username: 'manas',
      fullName: 'Manas Verma',
    };

    // call the registerUser method and subscribe to the observable
    service.registerUser(payload).subscribe();

    // expect that an HTTP POST request was made to the correct URL with the correct payload
    const req = httpMock.expectOne(`${BASE_URL}/auth/register`);

    // check that the request method is POST and the body matches the payload
    expect(req.request.method).toBe('POST');

    // check that the request body matches the payload
    expect(req.request.body).toEqual(payload);

    // flush a mock response to complete the request
    req.flush({
      success: true,
    });
  });

  // test for user login API call
  it('should login user', () => {
    const payload = {
      email: 'test@gmail.com',
      password: '123456',
    };

    // call the loginUser method and subscribe to the observable
    service.loginUser(payload).subscribe();

    // expect that an HTTP POST request was made to the correct URL with the correct payload
    const req = httpMock.expectOne(`${BASE_URL}/auth/login`);

    // check that the request method is POST and the body matches the payload
    expect(req.request.method).toBe('POST');

    // check that the request body matches the payload
    expect(req.request.body).toEqual(payload);

    // flush a mock response with a token to complete the request
    req.flush({
      token: 'jwt-token',
    });
  });

  // test for getting Google login URL
  // since this method just returns a string, we can directly test the return value without making an HTTP request
  it('should logout user', () => {
    service.logout().subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/logout`);

    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
    });
  });

  // test for searching users API call
  it('should search users', () => {
    const keyword = 'john';

    service.searchUsers(keyword).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/search?keyword=john`);

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  // tests for marking user online/offline, getting current user, updating profile, and uploading profile image
  it('should mark user online', () => {
    const userId = '123';

    service.markUserOnline(userId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/presence/online/123`);

    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
    });
  });

  // test for marking user offline API call
  it('should mark user offline', () => {
    const userId = '123';

    service.markUserOffline(userId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/presence/offline/123`);

    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
    });
  });

  // test for getting current user API call
  it('should get current user', () => {
    service.getCurrentUser().subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/auth/me`);

    expect(req.request.method).toBe('GET');

    req.flush({
      id: '1',
    });
  });

  // test for updating profile API call
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

  // test for uploading profile image API call
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
