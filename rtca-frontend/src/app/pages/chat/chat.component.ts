import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getUser } from '../../core/utils/auth.util';

import { SidebarComponent } from '../../features/chat/components/sidebar.component';
import { ChatWindowComponent } from '../../features/chat/components/chat-window.component';

import { MessageService } from '../../core/services/message.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';
import { RoomService } from '../../core/services/room.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ChatWindowComponent],
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
        position: relative;
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

      /* MODAL */

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }

      .create-room-modal {
        width: 500px;
        max-width: 92%;
        background: var(--bg-surface);
        border: 1px solid var(--border-subtle);
        border-radius: 18px;
        padding: 24px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
      }

      .modal-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--text-primary);
      }

      .modal-subtitle {
        font-size: 13px;
        color: var(--text-secondary);
        margin-bottom: 20px;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-label {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
      }

      .form-input,
      .form-select {
        width: 100%;
        padding: 12px 14px;
        border: 1px solid var(--border-subtle);
        border-radius: 12px;
        background: var(--bg-elevated);
        color: var(--text-primary);
        outline: none;
        font-size: 14px;
      }

      .form-input:focus,
      .form-select:focus {
        border-color: var(--accent);
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 24px;
      }

      .btn-cancel {
        padding: 10px 20px;
        border: 1px solid rgba(255, 255, 255, 0.18);
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .btn-cancel:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 230, 230, 0.28);
      }

      .btn-create {
        padding: 10px 20px;
        border: none;
        background: var(--accent);
        color: #111111;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .btn-create:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
      }

      .btn-create:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
      }

      .member-chip {
        display: inline-flex;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 10px;
        background: var(--bg-elevated);
        margin: 6px 6px 0 0;
      }

      .member-chip span {
        cursor: pointer;
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

  // NEW ROOM MODAL
  showCreateRoomModal = false;
  newRoomName = '';
  newRoomType = 'GROUP';

  // User info
  currentUser: any = null;

  // USER SEARCH (for adding members to room)
  userSearch = '';
  searchedUsers: any[] = [];
  selectedMembers: any[] = [];
  searchLoading = false;
  creatingRoom = false;

  /*
   MEMBER MANAGEMENT
  */
  showMembersModal = false;
  roomMembers: any[] = [];
  memberSearch = '';
  searchedNewMembers: any[] = [];

  typingUser = '';
  private typingSubscription: any;
  private typingTimer: any;

  showProfileModal = false;
  profileForm = {
    fullName: '',
    bio: '',
    avatarUrl: '',
  };
  selectedProfileFile: File | null = null;
  uploadingProfile = false;

  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.connectSocket();
    this.loadRooms();
    // window.addEventListener('beforeunload', this.handleWindowClose);
  }

  ngOnDestroy() {
    this.socketService.disconnect();

    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }
    // window.removeEventListener('beforeunload', this.handleWindowClose);
  }

  // handleWindowClose = () => {
  //   const userId = sessionStorage.getItem('userId');

  //   if (userId) {
  //     navigator.sendBeacon('http://localhost:8087/presence/offline/' + userId);
  //   }
  // };

  loadRooms() {
    this.loadingRooms = true;

    this.roomService.getUserRooms().subscribe({
      next: (data: any) => {
        this.rooms = (data || []).map((room: any) => ({
          id: room.roomId,
          name: room.name,
          type: room.type,

          /*
         FINAL FIX:
         keep memberCount + onlineCount from backend
        */
          memberCount: room.memberCount || 0,
          onlineCount: room.onlineCount || 0,
          lastMessage: 'No messages yet',
        }));

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

  selectRoom(room: any) {
    if (!room) return;

    this.selectedRoom = room;
    this.loadMessages(room.id);
    this.subscribeToRoom(room.id);
    // typing subscription should be separate so that it doesn't interfere with message subscription
    this.subscribeTyping(room.id);
    this.cdr.detectChanges();
  }

  loadMessages(roomId: string) {
    this.messageService.getMessagesByRoom(roomId).subscribe({
      next: (data: any) => {
        // this.messages = (data || []).map((msg: any) => ({
        //   ...msg,
        //   isOwn: String(msg.senderId) === String(sessionStorage.getItem('userId')),
        // }));

        // GROUP MESSAGES FROM SAME SENDER TOGETHER
        this.messages = (data || []).map((msg: any, index: number, arr: any[]) => {
          const isOwn = String(msg.senderId) === String(sessionStorage.getItem('userId'));

          const prev = arr[index - 1];

          const isSameSender = prev && String(prev.senderId) === String(msg.senderId);

          return {
            ...msg,
            isOwn,
            isFirstInGroup: !isSameSender,
          };
        });

        /*
       NEW:
       mark messages from other users as seen
      */
        this.messageService.markMessagesAsSeen(roomId).subscribe({
          next: () => {},
          error: (err: any) => {
            console.error('Failed to mark messages as seen:', err);
          },
        });

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Failed to load messages:', err);
      },
    });
  }

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
      if (String(msg.roomId) !== String(this.selectedRoom?.id)) {
        return;
      }

      // GROUPING LOGIC FOR NEW MESSAGES
      const last = this.messages[this.messages.length - 1];

      const isOwn = String(msg.senderId) === String(sessionStorage.getItem('userId'));

      const isSameSender = last && String(last.senderId) === String(msg.senderId);

      this.messages = [
        ...this.messages,
        {
          ...msg,
          isOwn,
          isFirstInGroup: !isSameSender,
        },
      ];

      this.cdr.detectChanges();
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
      senderId: sessionStorage.getItem('userId'),
      senderName: sessionStorage.getItem('username') || 'User',
      content: text,
    });
  }

  // MEDIA UPLOAD

  uploadMedia(file: File) {
    if (!this.selectedRoom) return;

    const userId = sessionStorage.getItem('userId');

    if (!userId) return;

    const formData = new FormData();
    formData.append('roomId', this.selectedRoom.roomId);
    formData.append('senderId', userId);
    formData.append('file', file);

    this.messageService.uploadMedia(formData).subscribe({
      next: (res: any) => {
        /*
       Send uploaded file URL as chat message
      */
        this.sendMessage(res.filePath);
      },

      error: (err: any) => {
        console.error('Media upload failed:', err);
      },
    });
  }

  /*
   NEW CREATE ROOM UI
  */

  handleCreateRoom() {
    this.showCreateRoomModal = true;
  }

  closeCreateRoomModal() {
    this.showCreateRoomModal = false;
    this.newRoomName = '';
    this.newRoomType = 'GROUP';

    this.userSearch = '';
    this.searchedUsers = [];
    this.selectedMembers = [];
  }

  // Submit new room creation
  submitCreateRoom() {
    if (!this.newRoomName.trim() || this.creatingRoom) return;

    this.creatingRoom = true;

    this.roomService
      .createRoom({
        name: this.newRoomName.trim(),
        type: this.newRoomType,
        memberIds: this.selectedMembers.map((m) => m.userId),
      })
      .subscribe({
        next: () => {
          this.creatingRoom = false;
          this.closeCreateRoomModal();
          this.loadRooms();
        },

        error: (err) => {
          console.error('Create room failed:', err);
          this.creatingRoom = false;
        },
      });
  }

  // LOGOUT
  handleLogout() {
    const userId = sessionStorage.getItem('userId');

    this.socketService.disconnect();

    if (userId) {
      this.authService.markUserOffline(userId).subscribe({
        next: () => {},
        error: (err) => {
          console.error('Failed to mark user offline', err);
        },
      });
    }

    this.authService.logout().subscribe({
      next: () => {
        sessionStorage.removeItem('connecthub_token');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
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

  // USER SEARCH FOR ADDING MEMBERS TO ROOM
  searchUsers() {
    if (!this.userSearch.trim()) {
      this.searchedUsers = [];
      return;
    }

    this.searchLoading = true;

    this.authService.searchUsers(this.userSearch.trim()).subscribe({
      next: (users: any) => {
        const currentUserId = sessionStorage.getItem('userId');

        this.searchedUsers = (users || []).filter(
          (u: any) =>
            String(u.userId) !== String(currentUserId) &&
            !this.selectedMembers.some((member) => String(member.userId) === String(u.userId)),
        );

        this.searchLoading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('User search failed:', err);
        this.searchLoading = false;
      },
    });
  }

  // SELECT USER TO ADD AS MEMBER
  addMember(user: any) {
    this.selectedMembers = [...this.selectedMembers, user];
    this.userSearch = '';
    this.searchedUsers = [];
  }

  removeMember(userId: string) {
    this.selectedMembers = this.selectedMembers.filter((m) => String(m.userId) !== String(userId));
  }

  /*
   VIEW MEMBERS
  */

  handleViewMembers() {
    if (!this.selectedRoom) return;

    this.roomService.getRoomMembers(this.selectedRoom.id).subscribe({
      next: (data: any) => {
        this.roomMembers = data || [];
        this.showMembersModal = true;
        this.cdr.detectChanges();
      },
    });
  }

  closeMembersModal() {
    this.showMembersModal = false;
    this.roomMembers = [];
    this.memberSearch = '';
    this.searchedNewMembers = [];
  }

  /*
   LEAVE ROOM
  */

  handleLeaveRoom() {
    if (!this.selectedRoom) return;

    this.roomService.leaveRoom(this.selectedRoom.id).subscribe({
      next: () => {
        this.selectedRoom = null;
        this.messages = [];
        this.loadRooms();
      },
    });
  }

  /*
   DELETE ROOM
  */

  handleDeleteRoom() {
    if (!this.selectedRoom) return;

    this.roomService.deleteRoom(this.selectedRoom.id).subscribe({
      next: () => {
        this.selectedRoom = null;
        this.messages = [];
        this.loadRooms();
      },
    });
  }

  /*
 ADD MEMBER INSIDE MEMBERS MODAL
*/

  searchNewMembers() {
    if (!this.memberSearch.trim() || !this.selectedRoom) {
      this.searchedNewMembers = [];
      return;
    }

    this.authService.searchUsers(this.memberSearch.trim()).subscribe({
      next: (users: any) => {
        const existingIds = this.roomMembers.map((m) => String(m.userId));
        const currentUserId = String(sessionStorage.getItem('userId'));

        this.searchedNewMembers = (users || []).filter(
          (u: any) => String(u.userId) !== currentUserId && !existingIds.includes(String(u.userId)),
        );

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Search new members failed:', err);
      },
    });
  }

  addMemberToExistingRoom(user: any) {
    if (!this.selectedRoom) return;

    this.roomService.addMemberToRoom(this.selectedRoom.id, user.userId).subscribe({
      next: () => {
        this.memberSearch = '';
        this.searchedNewMembers = [];
        this.handleViewMembers(); // refresh members list
      },

      error: (err) => {
        console.error('Add member failed:', err);
      },
    });
  }

  /*
 REMOVE MEMBER FROM EXISTING ROOM
*/

  removeMemberFromExistingRoom(memberId: string) {
    if (!this.selectedRoom) return;

    this.roomService.removeMemberFromRoom(this.selectedRoom.id, memberId).subscribe({
      next: () => {
        this.handleViewMembers(); // refresh
      },

      error: (err) => {
        console.error('Remove member failed:', err);
      },
    });
  }

  // TYPING EVENTS

  handleTyping() {
    if (!this.selectedRoom) return;

    this.socketService.sendTyping({
      roomId: this.selectedRoom.id,
      userName: sessionStorage.getItem('username') || 'User',
      typing: true,
    });
  }

  // SUBSCRIBE TO TYPING EVENTS
  subscribeTyping(roomId: string) {
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }

    this.typingSubscription = this.socketService.subscribeTyping(roomId, (event: any) => {
      const currentUser = sessionStorage.getItem('username') || 'User';

      if (event.userName === currentUser) {
        return;
      }

      if (event.typing) {
        this.typingUser = event.userName;

        clearTimeout(this.typingTimer);

        this.typingTimer = setTimeout(() => {
          this.typingUser = '';
          this.cdr.detectChanges();
        }, 1500);

        this.cdr.detectChanges();
      }
    });
  }

  // USER PROFILE
  openProfileModal() {
    this.profileForm = {
      fullName: this.currentUser?.fullName || '',
      bio: this.currentUser?.bio || '',
      avatarUrl: this.currentUser?.avatarUrl || '',
    };
    this.showProfileModal = true;
  }

  // close profile modal and reset selected file
  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedProfileFile = null;
  }

  // handle file selection for profile image
  onProfileFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedProfileFile = file;

    // preview instantly
    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.avatarUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  // if a new profile image is selected, upload it first and then save profile, otherwise just save profile
  uploadProfileImageAndSave() {
    if (!this.selectedProfileFile) {
      this.saveProfile();
      return;
    }

    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    this.uploadingProfile = true;

    this.authService.uploadProfileImage(this.selectedProfileFile, userId).subscribe({
      next: (res: any) => {
        this.profileForm.avatarUrl = res.filePath;
        this.saveProfile();
      },
      error: (err: any) => {
        console.error('Profile upload failed:', err);
        this.uploadingProfile = false;
      },
    });
  }

  // save profile details
  saveProfile() {
    this.authService.updateProfile(this.profileForm).subscribe({
      next: (updatedUser: any) => {
        this.currentUser = updatedUser;

        // update session
        sessionStorage.setItem('username', updatedUser.username);

        this.uploadingProfile = false;
        this.closeProfileModal();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Profile update failed:', err);
        this.uploadingProfile = false;
      },
    });
  }

  loadCurrentUser() {
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.currentUser = user;

        // sync minimal session data (optional)
        sessionStorage.setItem('username', user.username);

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load current user:', err);
      },
    });
  }

  deleteMessageForMe(messageId: string) {
    this.messageService.deleteMessageForMe(messageId).subscribe(() => {
      this.messages = this.messages.filter((m) => m.id !== messageId);
    });
  }

  deleteMessageForEveryone(messageId: string) {
    console.log('Delete for everyone:', messageId);
  }

  handleReaction(event: { messageId: string; emoji: string }) {
    this.messageService.reactToMessage(event.messageId, event.emoji).subscribe(() => {
      this.loadMessages(this.selectedRoom?.id); // 🔥 REQUIRED
    });
  }
}
