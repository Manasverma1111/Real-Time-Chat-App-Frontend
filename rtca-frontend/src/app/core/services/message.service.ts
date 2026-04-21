import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private api: ApiService) {}

  sendMessage(payload: any) {
    return this.api.post('/messages', payload);
  }

  getMessagesByRoom(roomId: string) {
    return this.api.get(`/messages?roomId=${roomId}`);
  }
}
