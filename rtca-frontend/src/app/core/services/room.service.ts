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
}
