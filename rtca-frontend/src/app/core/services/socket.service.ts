import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';

// This service manages the WebSocket connection using STOMP protocol for real-time communication with the backend.
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private stompClient: Client | null = null;

  // queue messages until connected
  private pendingMessages: any[] = [];

  // CONNECT TO WEBSOCKET SERVER
  connect(token: string, onConnect?: () => void, onError?: (err: any) => void) {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8087/ws',

      reconnectDelay: 5000,

      debug: (str) => {
        console.log('STOMP:', str);
      },

      // Include the JWT token in the connection headers for authentication
      connectHeaders: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},

      // Handle successful connection: log it and send any queued messages that were waiting for the connection to be established.
      onConnect: () => {
        console.log('WebSocket connected');

        // SEND QUEUED MESSAGES
        this.pendingMessages.forEach((msg) => this._publish(msg));
        this.pendingMessages = [];

        onConnect?.();
      },

      // Handle connection errors: log the error and call the provided onError callback if available.
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        onError?.(frame);
      },

      // Handle WebSocket errors: log the error and call the provided onError callback if available.
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
        onError?.(error);
      },
    });

    this.stompClient.activate();
  }

  // PRIVATE METHOD TO PUBLISH MESSAGES: this is called internally to send messages to the backend.
  // It checks if the stompClient is connected and then publishes the message to the /app/chat.send destination.
  private _publish(payload: any) {
    this.stompClient?.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    });
  }

  // PUBLIC METHOD TO SEND MESSAGES: this is the method that other parts of the application will call to send messages.
  // If the stompClient is not connected, it will queue the message instead of sending it immediately.
  send(payload: any) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('⚠️ Socket not connected → queued message');
      this.pendingMessages.push(payload);
      return;
    }

    console.log('🚀 Sending message to backend');
    this._publish(payload);
  }

  // PUBLIC METHOD TO SUBSCRIBE TO ROOM MESSAGES:
  // this is the method that other parts of the application will call to subscribe to messages in a specific room.
  subscribe(roomId: string, callback: (msg: any) => void) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Socket not connected');
      return null;
    }

    // Subscribe to the /topic/room/{roomId} topic to receive messages for that room.
    return this.stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      callback(JSON.parse(message.body));
    });
  }

  // PUBLIC METHOD TO SUBSCRIBE TO TYPING EVENTS:
  // this allows the application to receive real-time typing notifications for a specific room.
  subscribeTyping(roomId: string, callback: (msg: any) => void) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Socket not connected');
      return null;
    }

    // Subscribe to the /topic/typing/{roomId} topic to receive typing events for that room.
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

    // Subscribe to the /topic/notifications/{userId} topic to receive real-time notifications for the user.
    return this.stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
      callback(JSON.parse(message.body));
    });
  }

  /*
   REAL-TIME PRESENCE
   Subscribes to /topic/presence
   Fires whenever any user goes ONLINE or OFFLINE.
   Callback receives { userId: string, status: 'ONLINE' | 'OFFLINE' }
  */
  subscribePresence(callback: (event: { userId: string; status: string }) => void) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Socket not connected — cannot subscribe to presence');
      return null;
    }
    return this.stompClient.subscribe('/topic/presence', (message) => {
      callback(JSON.parse(message.body));
    });
  }

  // PUBLIC METHOD TO SEND TYPING EVENTS:
  // this allows the application to send real-time typing notifications to the backend,
  // which can then be broadcasted to other users in the same room.
  sendTyping(payload: any) {
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(payload),
    });
  }

  // PUBLIC METHOD TO DISCONNECT:
  // this can be called when the user logs out or when the application is closed to cleanly disconnect from the WebSocket server.
  disconnect() {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }

  /*
 REAL-TIME SEEN EVENTS
 Subscribes to /topic/seen/{roomId}
 Fires when another user reads messages in this room.
 Sender uses this to update ✓ → ✓✓ instantly.
*/
  subscribeSeen(roomId: string, callback: (event: any) => void) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Socket not connected — cannot subscribe to seen events');
      return null;
    }
    return this.stompClient.subscribe(`/topic/seen/${roomId}`, (message) => {
      callback(JSON.parse(message.body));
    });
  }
}
