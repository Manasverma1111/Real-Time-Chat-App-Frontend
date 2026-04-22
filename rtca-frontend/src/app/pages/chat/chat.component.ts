import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../features/chat/components/sidebar.component';
import { RoomService } from '../../core/services/room.service';
import { MessageService } from '../../core/services/message.service';
import { SocketService } from '../../core/services/socket.service';

import { ChatWindowComponent } from '../../features/chat/components/chat-window.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ChatWindowComponent, SidebarComponent],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy {
  rooms: any[] = [];
  selectedRoom: any = null;
  messages: any[] = [];

  socketConnected = false;
  private currentSubscription: any;

  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private socketService: SocketService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.loadRooms();
    this.connectSocket();
  }

  ngOnDestroy() {
    this.socketService.disconnect();

    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
  }

  // Load rooms
  loadRooms() {
    this.roomService.getUserRooms().subscribe((data: any) => {
      this.rooms = data || [];

      if (this.rooms.length > 0) {
        this.selectRoom(this.rooms[0]);
      }
    });
  }

  // Select room
  selectRoom(room: any) {
    this.selectedRoom = room;
    this.loadMessages(room.id);
    this.subscribeToRoom(room.id);
  }

  // Load messages
  loadMessages(roomId: string) {
    this.messageService.getMessagesByRoom(roomId).subscribe((data: any) => {
      this.messages = (data || []).map((msg: any) => ({
        ...msg,
        isOwn: msg.senderId === localStorage.getItem('userId'),
      }));
    });
  }

  // Connect WebSocket
  connectSocket() {
    const token = localStorage.getItem('connecthub_token');

    this.socketService.connect(
      token || '',
      () => {
        console.log('Socket connected');
        this.socketConnected = true;
      },
      (err) => console.error(err),
    );
  }

  // Subscribe to room (FIXED duplicate issue)
  subscribeToRoom(roomId: string) {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }

    this.currentSubscription = this.socketService.subscribe(roomId, (msg: any) => {
      this.messages = [
        ...this.messages,
        {
          ...msg,
          isOwn: msg.senderId === localStorage.getItem('userId'),
        },
      ];
    });
  }

  // Send message
  sendMessage(text: string) {
    if (!this.selectedRoom || !text.trim()) return;

    this.socketService.send({
      roomId: this.selectedRoom.id,
      senderId: localStorage.getItem('userId'),
      content: text,
    });
  }

  // Logout
  handleLogout() {
    localStorage.clear();
    this.socketService.disconnect();

    this.router.navigate(['/login']);
  }
}
