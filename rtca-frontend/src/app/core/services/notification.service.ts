import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private api: ApiService) {}

  /*
   GET USER NOTIFICATIONS
  */
//  This API returns a list of notifications for the user, 
// including both read and unread notifications. 
// Each notification includes details such as the type (message, room invite, etc.), content, timestamp, 
// and read status.
  getNotifications(userId: string) {
    return this.api.get(`/notifications/${userId}`);
  }

  /*
   MARK AS READ
  */
//  This API is called when the user clicks on a notification to view its details. 
// It updates the read status of the notification to true, so it will no longer be shown as unread in the UI. 
  markAsRead(notificationId: string) {
    return this.api.put(`/notifications/${notificationId}/read`, {});
  }
}
