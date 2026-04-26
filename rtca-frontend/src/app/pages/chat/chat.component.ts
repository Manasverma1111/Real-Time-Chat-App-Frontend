import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SidebarComponent } from '../../features/chat/components/sidebar.component';
import { ChatWindowComponent } from '../../features/chat/components/chat-window.component';

import { MessageService } from '../../core/services/message.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';
import { RoomService } from '../../core/services/room.service';

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
  loadingRooms = false;

  socketConnected = false;
  private currentSubscription: any;

  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.connectSocket();
    this.loadRooms();
  }

  ngOnDestroy() {
    this.socketService.disconnect();

    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
  }

  /*
   ========================
   LOAD ROOMS
   ========================
  */

  loadRooms() {
    this.loadingRooms = true;

    this.roomService.getUserRooms().subscribe({
      next: (data: any) => {
        this.rooms = (data || []).map((room: any) => ({
          id: room.roomId,
          name: room.name,
          type: room.type,
          lastMessage: 'No messages yet',
        }));

        // IMPORTANT FIX:
        // auto select first room immediately
        if (this.rooms.length > 0) {
          this.selectRoom(this.rooms[0]);
        }

        this.loadingRooms = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Failed to load rooms:', err);
        this.loadingRooms = false;
      },
    });
  }

  /*
   ========================
   SELECT ROOM
   ========================
  */

  selectRoom(room: any) {
    if (!room) return;

    this.selectedRoom = room;

    this.loadMessages(room.id);
    this.subscribeToRoom(room.id);

    this.cdr.detectChanges();
  }

  /*
   ========================
   LOAD MESSAGES
   ========================
  */

  loadMessages(roomId: string) {
    this.messageService.getMessagesByRoom(roomId).subscribe({
      next: (data: any) => {
        this.messages = (data || []).map((msg: any) => ({
          ...msg,
          isOwn: String(msg.senderId) === String(sessionStorage.getItem('userId')),

          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
        }));

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Failed to load messages:', err);
      },
    });
  }

  /*
   ========================
   SOCKET
   ========================
  */

  connectSocket() {
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
          isOwn: String(msg.senderId) === String(sessionStorage.getItem('userId')),

          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          }),
        },
      ];

      this.cdr.detectChanges();
    });
  }

  /*
   ========================
   SEND MESSAGE
   ========================
  */

  sendMessage(text: string) {
    if (!this.selectedRoom || !text.trim()) return;

    if (!this.socketConnected) {
      console.warn('Socket not connected');
      return;
    }

    this.socketService.send({
      roomId: this.selectedRoom.id,
      senderId: sessionStorage.getItem('userId'),

      // IMPORTANT FIX
      // set real username here
      senderName: sessionStorage.getItem('username') || 'User',

      content: text,
    });
  }

  /*
   ========================
   CREATE ROOM
   ========================
  */

  handleCreateRoom() {
    const roomName = prompt('Enter room name');

    if (!roomName?.trim()) return;

    this.roomService
      .createRoom({
        name: roomName.trim(),
        type: 'GROUP',
        memberIds: [],
      })
      .subscribe({
        next: () => {
          this.loadRooms();
        },

        error: (err) => {
          console.error('Create room failed:', err);
        },
      });
  }

  /*
   ========================
   LOGOUT
   ========================
  */

  handleLogout() {
    this.socketService.disconnect();

    this.authService.logout().subscribe({
      next: () => {
        sessionStorage.removeItem('connecthub_token');
        sessionStorage.removeItem('userId');
        this.router.navigate(['/login']);
      },

      error: () => {
        sessionStorage.removeItem('connecthub_token');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        this.router.navigate(['/login']);
      },
    });
  }
}
