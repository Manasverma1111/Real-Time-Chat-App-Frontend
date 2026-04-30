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

  /*
   NEW
  */
  markMessagesAsSeen(roomId: string) {
    return this.api.put(`/messages/${roomId}/seen`, {});
  }

  /*
   MEDIA UPLOAD
  */
  uploadMedia(formData: FormData) {
    return this.api.post('/media/upload', formData);
  }

  getRoomMedia(roomId: string) {
    return this.api.get(`/media/room/${roomId}`);
  }
}
