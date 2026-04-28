import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private stompClient: Client | null = null;

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

  subscribe(roomId: string, callback: (msg: any) => void) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Socket not connected');
      return null;
    }

    return this.stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
      callback(JSON.parse(message.body));
    });
  }

  send(payload: any) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Socket not connected');
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    });
  }

  disconnect() {
    this.stompClient?.deactivate();
    this.stompClient = null;
  }
}
