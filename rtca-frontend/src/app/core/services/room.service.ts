import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor(private api: ApiService) {}

  // GET USER ROOMS API: returns a list of rooms that the current user is a member of.
  getUserRooms() {
    return this.api.get('/rooms');
  }

// CREATE ROOM API: accepts room details such as name, type (private/group), and an optional list of initial member IDs. 
// It creates a new room and returns the details of the created room including its unique ID.
  createRoom(payload: any) {
    return this.api.post('/rooms', payload);
  }

  /*
   ROOM MEMBER MANAGEMENT
  */
// GET ROOM MEMBERS API: returns a list of members in the specified room, 
// including their user details and online status.
  getRoomMembers(roomId: string) {
    return this.api.get(`/rooms/${roomId}/members`);
  }

  // ADD MEMBER TO ROOM API: adds a user to the specified room by their user ID.
  addMemberToRoom(roomId: string, memberId: string) {
    return this.api.post(`/rooms/${roomId}/members/${memberId}`, {});
  }

  // REMOVE MEMBER FROM ROOM API: removes a user from the specified room by their user ID.
  removeMemberFromRoom(roomId: string, memberId: string) {
    return this.api.delete(`/rooms/${roomId}/members/${memberId}`);
  }

  // LEAVE ROOM API: allows the current user to leave the specified room.
  leaveRoom(roomId: string) {
    return this.api.delete(`/rooms/${roomId}/leave`);
  }

  // DELETE ROOM API: deletes the specified room. 
  // This action is typically restricted to room admins or the user who created the room.
  deleteRoom(roomId: string) {
    return this.api.delete(`/rooms/${roomId}`);
  }

  /*
 PUBLIC GROUPS
*/
// GET PUBLIC GROUPS API: returns a list of all public groups that users can join.
  getPublicGroups() {
    return this.api.get('/rooms/public');
  }

  // JOIN PUBLIC GROUP API: allows the current user to join a public group by its room ID.
  joinPublicGroup(roomId: string) {
    return this.api.post(`/rooms/${roomId}/join`, {});
  }

  /*
   GROUP DETAILS
  */
// GET ROOM DETAILS API: returns detailed information about a specific room, 
// including its name, type, members, and avatar URL.
  getRoomDetails(roomId: string) {
    return this.api.get(`/rooms/${roomId}`);
  }

  // UPDATE ROOM API: allows updating the room's name and type (e.g., changing from private to group or vice versa).
  updateRoom(roomId: string, payload: any) {
    return this.api.put(`/rooms/${roomId}`, payload);
  }

  // UPLOAD GROUP AVATAR API: allows uploading an avatar image for a group room.
  uploadGroupAvatar(roomId: string, file: File) {
    const formData = new FormData();

    // Appending roomId to the form data to associate the uploaded avatar with the correct room.
    formData.append('roomId', roomId);
    formData.append('file', file);

    return this.api.post('/media/upload/group', formData);
  }

  // UPDATE ROOM AVATAR API: updates the avatar URL for the specified room.
  updateRoomAvatar(roomId: string, avatarUrl: string) {
    return this.api.put(`/rooms/${roomId}/avatar?avatarUrl=${encodeURIComponent(avatarUrl)}`, {});
  }
}
