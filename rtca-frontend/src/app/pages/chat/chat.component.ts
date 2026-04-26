import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SidebarComponent } from '../../features/chat/components/sidebar.component';
import { ChatWindowComponent } from '../../features/chat/components/chat-window.component';

import { MessageService } from '../../core/services/message.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ChatWindowComponent],
  templateUrl: './chat.component.html',
  styles: [
    `
      :host {
        display: flex;
        height: 100vh;
        overflow: hidden;
      }

      .chat-layout {
        display: flex;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        background: var(--bg-base);
      }

      .chat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        height: 100vh;
        overflow: hidden;
      }

      app-sidebar {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      app-chat-window {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
    `,
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  rooms: any[] = [];
  selectedRoom: any = null;
  messages: any[] = [];

  socketConnected = false;
  private currentSubscription: any;

  constructor(
    private messageService: MessageService,
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.connectSocket();

    this.rooms = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'General Chat',
      },
    ];

    this.selectRoom(this.rooms[0]);
  }

  ngOnDestroy() {
    this.socketService.disconnect();

    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
  }

  selectRoom(room: any) {
    this.selectedRoom = room;
    this.loadMessages(room.id);
    this.subscribeToRoom(room.id);
  }

  loadMessages(roomId: string) {
    this.messageService.getMessagesByRoom(roomId).subscribe((data: any) => {
      this.messages = (data || []).map((msg: any) => ({
        ...msg,

        // IMPORTANT FIX
        isOwn: String(msg.senderId) === String(sessionStorage.getItem('userId')),

        text: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
      }));
    });
  }

  connectSocket() {
    // IMPORTANT: sessionStorage
    const token = sessionStorage.getItem('connecthub_token');

    this.socketService.connect(
      token || '',
      () => {
        console.log('Socket connected');
        this.socketConnected = true;
      },
      (err) => {
        console.error('WebSocket Error:', err);
        this.socketConnected = false;
      },
    );
  }

  subscribeToRoom(roomId: string) {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }

    this.currentSubscription = this.socketService.subscribe(roomId, (msg: any) => {
      this.messages = [
        ...this.messages,
        {
          ...msg,

          // IMPORTANT FIX
          isOwn: String(msg.senderId) === String(sessionStorage.getItem('userId')),

          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
        },
      ];
    });
  }

  sendMessage(text: string) {
    if (!this.selectedRoom || !text.trim()) return;

    if (!this.socketConnected) {
      console.warn('Socket not connected');
      return;
    }

    this.socketService.send({
      roomId: this.selectedRoom.id,

      // IMPORTANT: sessionStorage
      senderId: sessionStorage.getItem('userId'),

      content: text,
    });
  }

  handleCreateRoom() {
    const roomName = prompt('Enter room name');

    if (!roomName || !roomName.trim()) return;

    const newRoom = {
      id: crypto.randomUUID(),
      name: roomName.trim(),
    };

    this.rooms = [...this.rooms, newRoom];
    this.selectRoom(newRoom);
  }

  handleLogout() {
    this.socketService.disconnect();

    this.authService.logout().subscribe({
      next: () => {
        // IMPORTANT: sessionStorage
        sessionStorage.removeItem('connecthub_token');
        sessionStorage.removeItem('userId');

        this.router.navigate(['/login']);
      },

      error: (err) => {
        console.error('Logout failed:', err);

        sessionStorage.removeItem('connecthub_token');
        sessionStorage.removeItem('userId');

        this.router.navigate(['/login']);
      },
    });
  }
}
