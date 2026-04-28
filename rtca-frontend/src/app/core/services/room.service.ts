import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor(private api: ApiService) {}

  getUserRooms() {
    return this.api.get('/rooms');
  }

  createRoom(payload: any) {
    return this.api.post('/rooms', payload);
  }

  /*
   ROOM MEMBER MANAGEMENT
  */

  getRoomMembers(roomId: string) {
    return this.api.get(`/rooms/${roomId}/members`);
  }

  addMemberToRoom(roomId: string, memberId: string) {
    return this.api.post(`/rooms/${roomId}/members/${memberId}`, {});
  }

  removeMemberFromRoom(roomId: string, memberId: string) {
    return this.api.delete(`/rooms/${roomId}/members/${memberId}`);
  }

  leaveRoom(roomId: string) {
    return this.api.delete(`/rooms/${roomId}/leave`);
  }

  deleteRoom(roomId: string) {
    return this.api.delete(`/rooms/${roomId}`);
  }
}
