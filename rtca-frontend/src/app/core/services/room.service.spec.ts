import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RoomService } from './room.service';
import { ApiService } from '../api/api.service';

describe('RoomService', () => {
  let service: RoomService;
  let httpMock: HttpTestingController;

  const BASE_URL = 'http://localhost:8087';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoomService, ApiService],
    });

    service = TestBed.inject(RoomService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create room service', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user rooms', () => {
    service.getUserRooms().subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/rooms`);

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should create a room', () => {
    const payload = {
      name: 'General',
      type: 'GROUP',
    };

    service.createRoom(payload).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/rooms`);

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual(payload);

    req.flush({
      roomId: '1',
    });
  });

  it('should get room members', () => {
    const roomId = 'room1';

    service.getRoomMembers(roomId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/rooms/room1/members`);

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should add member to room', () => {
    const roomId = 'room1';
    const memberId = 'user1';

    service.addMemberToRoom(roomId, memberId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/rooms/room1/members/user1`);

    expect(req.request.method).toBe('POST');

    req.flush({
      success: true,
    });
  });

  it('should remove member from room', () => {
    const roomId = 'room1';
    const memberId = 'user1';

    service.removeMemberFromRoom(roomId, memberId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/rooms/room1/members/user1`);

    expect(req.request.method).toBe('DELETE');

    req.flush({
      success: true,
    });
  });

  it('should leave room', () => {
    const roomId = 'room1';

    service.leaveRoom(roomId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/rooms/room1/leave`);

    expect(req.request.method).toBe('DELETE');

    req.flush({
      success: true,
    });
  });

  it('should delete room', () => {
    const roomId = 'room1';

    service.deleteRoom(roomId).subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/rooms/room1`);

    expect(req.request.method).toBe('DELETE');

    req.flush({
      success: true,
    });
  });
});
