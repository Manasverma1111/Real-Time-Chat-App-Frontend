import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private stompClient: Client | null = null;

  // ✅ queue messages until connected
  private pendingMessages: any[] = [];

  connect(token: string, onConnect?: () => void, onError?: (err: any) => void) {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8087/ws',

      reconnectDelay: 5000,

      debug: (str) => {
        console.log('STOMP:', str);
      },

      connectHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},

      onConnect: () => {
        console.log('WebSocket connected');

        // SEND QUEUED MESSAGES
        this.pendingMessages.forEach((msg) => this._publish(msg));
        this.pendingMessages = [];

        onConnect?.();
      },

      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        onError?.(frame);
      },

      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        onError?.(error);
      },
    });

    this.stompClient.activate();
  }

  private _publish(payload: any) {
    this.stompClient?.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    });
  }

  send(payload: any) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('⚠️ Socket not connected → queued message');
      this.pendingMessages.push(payload);
      return;
    }

    console.log('🚀 Sending message to backend');
    this._publish(payload);
  }

  subscribe(roomId: string, callback: (msg: any) => void) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Socket not connected');
      return null;
    }

    return this.stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      callback(JSON.parse(message.body));
    });
  }

  subscribeTyping(roomId: string, callback: (msg: any) => void) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Socket not connected');
      return null;
    }

    return this.stompClient.subscribe(`/topic/typing/${roomId}`, (message) => {
      callback(JSON.parse(message.body));
    });
  }

  /*
   REAL-TIME NOTIFICATIONS
   Subscribes to /topic/notifications/{userId}
   Called once after socket connects + userId is known
  */
  subscribeNotifications(userId: string, callback: (notification: any) => void) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Socket not connected — cannot subscribe to notifications');
      return null;
    }

    return this.stompClient.subscribe(
      `/topic/notifications/${userId}`,
      (message) => {
        callback(JSON.parse(message.body));
      }
    );
  }

  sendTyping(payload: any) {
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(payload),
    });
  }

  disconnect() {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }
}