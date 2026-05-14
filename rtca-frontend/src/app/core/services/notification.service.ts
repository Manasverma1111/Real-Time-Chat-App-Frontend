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
  getNotifications(userId: string) {
    return this.api.get(`/notifications/${userId}`);
  }

  /*
   MARK AS READ
  */
  markAsRead(notificationId: string) {
    return this.api.put(`/notifications/${notificationId}/read`, {});
  }
}
