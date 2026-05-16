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

  getMessagesByRoom(roomId: string, page: number = 0, size: number = 20) {
    return this.api.get(`/messages?roomId=${roomId}&page=${page}&size=${size}`);
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

  // delete message for me
  deleteMessageForMe(messageId: string) {
    return this.api.put(`/messages/${messageId}/delete/me`, {});
  }

  reactToMessage(messageId: string, emoji: string) {
    return this.api.put(`/messages/${messageId}/react?emoji=${emoji}`, {});
  }
}
