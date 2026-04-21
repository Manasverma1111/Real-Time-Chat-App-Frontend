import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private stompClient: Client | null = null;

  connect(token: string, onConnect?: () => void, onError?: (err: any) => void) {
    const socketUrl = 'http://localhost:8083/ws';

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      debug: (str) => console.log('STOMP:', str),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        console.log('WebSocket connected');
        onConnect?.();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        onError?.(frame);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
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
      try {
        callback(JSON.parse(message.body));
      } catch (e) {
        console.error('Parse error:', e);
      }
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
