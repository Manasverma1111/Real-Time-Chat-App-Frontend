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

  /*
 PUBLIC GROUPS
*/

  getPublicGroups() {
    return this.api.get('/rooms/public');
  }

  joinPublicGroup(roomId: string) {
    return this.api.post(`/rooms/${roomId}/join`, {});
  }

  /*
   GROUP DETAILS
  */

  getRoomDetails(roomId: string) {
    return this.api.get(`/rooms/${roomId}`);
  }

  updateRoom(roomId: string, payload: any) {
    return this.api.put(`/rooms/${roomId}`, payload);
  }

  uploadGroupAvatar(roomId: string, file: File) {
    const formData = new FormData();

    formData.append('roomId', roomId);
    formData.append('file', file);

    return this.api.post('/media/upload/group', formData);
  }

  updateRoomAvatar(roomId: string, avatarUrl: string) {
    return this.api.put(`/rooms/${roomId}/avatar?avatarUrl=${encodeURIComponent(avatarUrl)}`, {});
  }
}
