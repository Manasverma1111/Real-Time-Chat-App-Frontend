import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private api: ApiService) {}

  // SEND MESSAGE API: expects { roomId, content, type (text/image/file), mediaUrl (if type is image/file) }
  sendMessage(payload: any) {
    return this.api.post('/messages', payload);
  }

  // GET MESSAGES API: supports pagination with page and size parameters. 
  // Returns messages sorted by timestamp in ascending order.
  getMessagesByRoom(roomId: string, page: number = 0, size: number = 20) {
    return this.api.get(`/messages?roomId=${roomId}&page=${page}&size=${size}`);
  }

//  Mark messages as seen when the user views the chat window. 
// This will update the seen status of all messages in the room for the current user.
  markMessagesAsSeen(roomId: string) {
    return this.api.put(`/messages/${roomId}/seen`, {});
  }

  /*
   MEDIA UPLOAD
  */
//  This method can be used for uploading both images and files. 
// The backend will determine the type based on the file content.
  uploadMedia(formData: FormData) {
    return this.api.post('/media/upload', formData);
  }

  // Get all media (images/files) shared in a room. 
  // This can be used to show a gallery of shared media in the room details.
  getRoomMedia(roomId: string) {
    return this.api.get(`/media/room/${roomId}`);
  }

  // delete message for me
  // This will mark the message as deleted for the current user but it will still be visible to other members of the room.
  deleteMessageForMe(messageId: string) {
    return this.api.put(`/messages/${messageId}/delete/me`, {});
  }

  // react to a message with an emoji. 
  // This will add the reaction to the message and it will be visible to all members of the room.
  reactToMessage(messageId: string, emoji: string) {
    return this.api.put(`/messages/${messageId}/react?emoji=${emoji}`, {});
  }
}
