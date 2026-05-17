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
import { NotificationService } from '../../core/services/notification.service';

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

      /* =========================
   NOTIFICATION MODAL
========================= */

      .notification-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(6px);
        z-index: 99999;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 20px;
      }

      .notification-modal {
        width: 100%;
        max-width: 440px;

        max-height: 80vh;

        background: #12121a;
        border: 1px solid rgba(255, 255, 255, 0.08);

        border-radius: 20px;

        display: flex;
        flex-direction: column;

        overflow: hidden;

        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
      }

      .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 18px 20px;

        border-bottom: 1px solid rgba(255, 255, 255, 0.06);

        flex-shrink: 0;
      }

      .notification-title {
        font-size: 22px;
        font-weight: 700;
        color: white;
      }

      .notification-subtitle {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);

        margin-top: 4px;
      }

      .notification-close {
        width: 34px;
        height: 34px;

        border: none;
        border-radius: 10px;

        background: rgba(255, 255, 255, 0.06);

        color: white;

        cursor: pointer;

        transition: 0.2s ease;
      }

      .notification-close:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      .notification-body {
        overflow-y: auto;

        padding: 14px;

        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .notification-item {
        background: rgba(255, 255, 255, 0.04);

        border: 1px solid rgba(255, 255, 255, 0.05);

        border-radius: 14px;

        padding: 14px;

        transition: 0.2s ease;
      }

      .notification-item.unread {
        border-color: rgba(212, 175, 55, 0.45);

        background: rgba(212, 175, 55, 0.08);
      }

      .notification-message {
        color: white;

        font-size: 14px;
        line-height: 1.5;

        word-break: break-word;
      }

      .notification-time {
        margin-top: 8px;

        font-size: 12px;

        color: rgba(255, 255, 255, 0.45);
      }

      .mark-read-btn {
        margin-top: 10px;

        border: none;

        background: #d4af37;
        color: black;

        padding: 8px 12px;

        border-radius: 10px;

        font-size: 12px;
        font-weight: 600;

        cursor: pointer;
      }

      .notification-empty {
        padding: 40px 20px;

        text-align: center;

        color: rgba(255, 255, 255, 0.5);
      }
    `,
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  rooms: any[] = [];
  selectedRoom: any = null;
  messages: any[] = [];
  publicGroups: any[] = [];
  loadingRooms = false;

  socketConnected = false;
  private currentSubscription: any;

  // NEW ROOM MODAL
  showCreateRoomModal = false;
  newRoomName = '';
  newRoomType = 'GROUP';
  newRoomVisibility = 'PRIVATE';
  newRoomDescription = '';

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

  /*
   GROUP DETAILS MODAL
  */
  showGroupDetailsModal = false;
  groupDetails: any = null;

  groupForm = {
    name: '',
    description: '',
    visibility: 'PRIVATE',
    avatarUrl: '',
  };

  selectedGroupFile: File | null = null;
  uploadingGroupAvatar = false;
  isCurrentUserRoomAdmin = false;

  /*
   NOTIFICATIONS
  */
  notifications: any[] = [];
  showNotificationsModal = false;
  unreadNotificationCount = 0;

  /*
 FORWARD MESSAGE
*/
  showForwardModal = false;
  forwardingMessage: any = null;
  selectedForwardRooms: string[] = [];
  forwardingInProgress = false;

  /*
 USER PROFILE VIEWER
 Shows when clicking a member in the members modal
*/
  showUserProfileModal = false;
  viewingUserProfile: any = null;
  loadingUserProfile = false;

  // PAGINATION FOR MESSAGES
  currentPage = 0;
  pageSize = 20;
  loadingOlderMessages = false;
  hasMoreMessages = true;

  /*

   =========================================
   REAL-TIME NOTIFICATION SUBSCRIPTION
   Replaces polling interval
   =========================================
  */
  private notificationSubscription: any;

  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.connectSocket();
    this.loadRooms();
    this.loadPublicGroups();

    /*
     INITIAL LOAD of existing notifications from DB
    */
    this.loadNotifications();
  }

  ngOnDestroy() {
    /*
     DISCONNECT SOCKET
    */
    this.socketService.disconnect();

    /*
     CLEAN ROOM SUBSCRIPTION
    */
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }

    /*
     CLEAN NOTIFICATION SUBSCRIPTION
    */
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  loadRooms() {
    this.loadingRooms = true;

    this.roomService.getUserRooms().subscribe({
      next: (data: any) => {
        this.rooms = (data || []).map((room: any) => ({
          id: room.roomId || room.id,
          roomId: room.roomId,
          name: room.name,
          type: room.type,
          avatarUrl: room.avatarUrl || '',
          memberCount: room.memberCount || 0,
          onlineCount: room.onlineCount || 0,
          lastMessage: 'Loading...',
        }));

        const currentUserId = sessionStorage.getItem('userId');

        const savedRoomId = currentUserId
          ? localStorage.getItem(`selectedRoomId_${currentUserId}`)
          : null;

        if (savedRoomId) {
          const matchedRoom = this.rooms.find(
            (room: any) => String(room.roomId) === String(savedRoomId),
          );

          if (matchedRoom) {
            this.selectRoom(matchedRoom);
            this.loadingRooms = false;
            this.cdr.detectChanges();
            return;
          }
        }

        if (this.rooms.length > 0) {
          this.selectRoom(this.rooms[0]);
        }

        this.hydrateSidebarLastMessages();

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

    const currentUserId = sessionStorage.getItem('userId');
    if (currentUserId) {
      localStorage.setItem(`selectedRoomId_${currentUserId}`, room.roomId || room.id);
    }

    this.loadMessages(room.id, true);
    this.subscribeToRoom(room.id);
    this.subscribeTyping(room.id);

    /*
   SILENTLY FETCH ROOM MEMBERS
   so roomMembers is always available for
   profile role lookup when clicking bubble avatars
  */
    this.roomService.getRoomMembers(room.id).subscribe({
      next: (data: any) => {
        this.roomMembers = data || [];
      },
      error: () => {},
    });

    this.cdr.detectChanges();
  }

  loadMessages(roomId: string, reset: boolean = true) {
    if (this.loadingOlderMessages) return;

    if (reset) {
      this.currentPage = 0;
      this.hasMoreMessages = true;
      this.messages = [];
    }

    this.loadingOlderMessages = true;

    this.messageService.getMessagesByRoom(roomId, this.currentPage, this.pageSize).subscribe({
      next: (data: any) => {
        const formattedMessages = (data || []).map((msg: any, index: number, arr: any[]) => {
          const isOwn = String(msg.senderId) === String(sessionStorage.getItem('userId'));

          const prev = arr[index - 1];

          const isSameSender = prev && String(prev.senderId) === String(msg.senderId);

          return {
            ...msg,
            isOwn,
            avatarUrl: this.resolveProfileImage(msg.avatarUrl),
            isFirstInGroup: !isSameSender,
          };
        });

        /*
         RESET = fresh room load
        */
        if (reset) {
          this.messages = formattedMessages;

          /*
        update sidebar last message
        */
          if (formattedMessages.length > 0 && this.selectedRoom) {
            const latestMessage = formattedMessages[formattedMessages.length - 1];

            this.updateRoomLastMessage(roomId, this.getSidebarMessagePreview(latestMessage));
          }

          setTimeout(() => {
            const container = document.querySelector('.messages-area') as HTMLElement;

            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          }, 50);
        } else {
          /*
           prepend older messages
          */
          this.messages = [...formattedMessages, ...this.messages];
        }

        /*
         pagination end detection
        */
        if (formattedMessages.length < this.pageSize) {
          this.hasMoreMessages = false;
        }

        this.loadingOlderMessages = false;

        /*
         next page
        */
        this.currentPage++;

        this.messageService.markMessagesAsSeen(roomId).subscribe({
          next: () => {
            this.notifications = this.notifications.map((notification: any) => {
              if (String(notification.roomId) === String(roomId)) {
                return {
                  ...notification,
                  read: true,
                };
              }

              return notification;
            });

            this.unreadNotificationCount = this.notifications.filter((n: any) => !n.read).length;

            this.cdr.detectChanges();
          },
        });

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Failed to load messages:', err);
        this.loadingOlderMessages = false;
      },
    });
  }

  loadOlderMessages() {
    if (!this.selectedRoom) return;

    if (!this.hasMoreMessages) return;

    this.loadMessages(this.selectedRoom.id, false);
  }

  connectSocket() {
    const token = sessionStorage.getItem('connecthub_token');

    this.socketService.connect(
      token || '',
      () => {
        console.log('Socket connected');
        this.socketConnected = true;

        /*
         =========================================
         SUBSCRIBE TO REAL-TIME NOTIFICATIONS
         once socket is connected and userId known
         =========================================
        */
        const userId = sessionStorage.getItem('userId');

        if (userId) {
          this.notificationSubscription = this.socketService.subscribeNotifications(
            userId,
            (notification: any) => {
              console.log('🔔 Real-time notification received:', notification);

              /*
               PREPEND new notification to top of list
              */
              this.notifications = [notification, ...this.notifications];

              /*
               INCREMENT unread badge
              */
              this.unreadNotificationCount = this.notifications.filter((n: any) => !n.read).length;

              this.cdr.detectChanges();
            },
          );
        }
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

      console.log('🔥 SOCKET MESSAGE:', msg);
      console.log('🔥 CONTENT:', msg.content);
      console.log('🔥 CONTENT TYPE:', typeof msg.content);

      const last = this.messages[this.messages.length - 1];
      const isOwn = String(msg.senderId) === String(sessionStorage.getItem('userId'));
      const isSameSender = last && String(last.senderId) === String(msg.senderId);

      this.messages = [
        ...this.messages,
        {
          ...msg,
          isOwn,
          avatarUrl: this.resolveProfileImage(msg.avatarUrl),
          isFirstInGroup: !isSameSender,
        },
      ];

      /*
      update sidebar instantly
      */
      this.updateRoomLastMessage(roomId, this.getSidebarMessagePreview(msg));

      /*
 WHATSAPP-LIKE BEHAVIOR
 If user is already inside the room,
 immediately mark messages as seen
 and clear notifications for this room.
*/
      if (String(msg.roomId) === String(this.selectedRoom?.id) && !isOwn) {
        this.messageService.markMessagesAsSeen(roomId).subscribe({
          next: () => {
            /*
       Remove notifications for current room
      */
            this.notifications = this.notifications.map((notification: any) => {
              if (String(notification.roomId) === String(roomId)) {
                return {
                  ...notification,
                  read: true,
                };
              }

              return notification;
            });

            /*
       Recalculate unread count
      */
            this.unreadNotificationCount = this.notifications.filter((n: any) => !n.read).length;

            this.cdr.detectChanges();
          },

          error: (err: any) => {
            console.error('Failed to mark messages as seen:', err);
          },
        });
      }

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
      avatarUrl: this.currentUser?.avatarUrl || '',
      content: text,
    });
  }

  uploadMedia(file: File) {
    if (!this.selectedRoom) return;

    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    const formData = new FormData();
    formData.append('roomId', this.selectedRoom.id);
    formData.append('senderId', userId);
    formData.append('file', file);

    this.messageService.uploadMedia(formData).subscribe({
      next: (res: any) => {
        console.log('✅ Upload response:', res);

        setTimeout(() => {
          this.socketService.send({
            roomId: this.selectedRoom.id,
            senderId: userId,
            senderName: sessionStorage.getItem('username') || 'User',
            avatarUrl: this.currentUser?.avatarUrl || '',
            content: res.filePath,
          });
        }, 300);
      },

      error: (err: any) => {
        console.error('Media upload failed:', err);
      },
    });
  }

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

  submitCreateRoom() {
    if (!this.newRoomName.trim() || this.creatingRoom) return;

    this.creatingRoom = true;

    this.roomService
      .createRoom({
        name: this.newRoomName.trim(),
        type: this.newRoomType,
        memberIds: this.selectedMembers.map((m) => m.userId),
        visibility: this.newRoomVisibility,
        description: this.newRoomDescription,
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

  loadPublicGroups() {
    this.roomService.getPublicGroups().subscribe({
      next: (groups: any) => {
        this.publicGroups = groups || [];
      },
      error: (err) => {
        console.error('Failed to load public groups', err);
      },
    });
  }

  joinGroup(room: any) {
    this.roomService.joinPublicGroup(room.roomId).subscribe({
      next: () => {
        this.loadRooms();
        this.loadPublicGroups();
        this.publicGroups = this.publicGroups.filter((g) => g.roomId !== room.roomId);
      },

      error: (err) => {
        console.error('Failed to join group', err);
      },
    });
  }

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

  addMember(user: any) {
    this.selectedMembers = [...this.selectedMembers, user];
    this.userSearch = '';
    this.searchedUsers = [];
  }

  removeMember(userId: string) {
    this.selectedMembers = this.selectedMembers.filter((m) => String(m.userId) !== String(userId));
  }

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
        this.handleViewMembers();
      },

      error: (err) => {
        console.error('Add member failed:', err);
      },
    });
  }

  removeMemberFromExistingRoom(memberId: string) {
    if (!this.selectedRoom) return;

    this.roomService.removeMemberFromRoom(this.selectedRoom.id, memberId).subscribe({
      next: () => {
        this.handleViewMembers();
      },

      error: (err) => {
        console.error('Remove member failed:', err);
      },
    });
  }

  handleTyping() {
    if (!this.selectedRoom) return;

    this.socketService.sendTyping({
      roomId: this.selectedRoom.id,
      userName: sessionStorage.getItem('username') || 'User',
      typing: true,
    });
  }

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

  openProfileModal() {
    this.profileForm = {
      fullName: this.currentUser?.fullName || '',
      bio: this.currentUser?.bio || '',
      avatarUrl: this.resolveProfileImage(this.currentUser?.avatarUrl),
    };

    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedProfileFile = null;
  }

  onProfileFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedProfileFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.avatarUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

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

  saveProfile() {
    this.authService.updateProfile(this.profileForm).subscribe({
      next: (updatedUser: any) => {
        this.currentUser = updatedUser;
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
        this.currentUser = {
          ...user,
          avatarUrl: this.resolveProfileImage(user?.avatarUrl),
        };

        sessionStorage.setItem('username', user.username);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load current user:', err);
      },
    });
  }

  /*
   =========================================
   LOAD NOTIFICATIONS FROM DB ON STARTUP
   Called once on init to hydrate the list
   =========================================
  */
  /*
 =========================================
 LOAD NOTIFICATIONS FROM DB
 =========================================
*/
  loadNotifications(silent: boolean = false) {
    /*
   CRITICAL FIX:
   Backend may return userId or id depending on the endpoint.
   Try both fields with fallback.
  */
    const userId = this.currentUser?.userId || this.currentUser?.id;

    if (!userId) {
      return;
    }

    this.notificationService.getNotifications(userId).subscribe({
      next: (notifications: any) => {
        this.notifications = notifications || [];
        this.unreadNotificationCount = this.notifications.filter((n: any) => !n.read).length;

        if (!silent) {
          console.log('Notifications loaded:', this.notifications.length);
        }
      },

      error: (err) => {
        console.error('Failed to load notifications:', err);
      },
    });
  }

  /*
 =========================================
 OPEN NOTIFICATIONS MODAL
 Always re-fetch from DB first so
 notification.id values are real UUIDs
 (WebSocket payload ids are temporary)
 =========================================
*/
  openNotificationsModal() {
    this.showNotificationsModal = true;

    const userId = this.currentUser?.userId || this.currentUser?.id;

    if (!userId) {
      return;
    }

    /*
   Re-fetch from DB to get real persisted UUIDs
   before calling markAsRead
  */
    this.notificationService.getNotifications(userId).subscribe({
      next: (notifications: any) => {
        this.notifications = notifications || [];

        /*
       Mark all unread as read using real DB UUIDs
      */
        this.notifications.forEach((notification: any) => {
          if (!notification.read && notification.id) {
            this.notificationService.markAsRead(notification.id).subscribe({
              next: () => {},
              error: (err: any) => {
                console.error('Failed to mark notification as read:', err);
              },
            });
          }
        });

        /*
       Optimistic UI update
      */
        this.notifications = this.notifications.map((n: any) => ({
          ...n,
          read: true,
        }));

        this.unreadNotificationCount = 0;
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Failed to load notifications before marking read:', err);
      },
    });
  }

  closeNotificationsModal() {
    this.showNotificationsModal = false;
  }

  openGroupDetailsModal() {
    if (!this.selectedRoom) return;

    this.roomService.getRoomDetails(this.selectedRoom.id).subscribe({
      next: (room: any) => {
        this.groupDetails = room;

        const currentUserId = sessionStorage.getItem('userId');
        this.isCurrentUserRoomAdmin = String(room.createdBy) === String(currentUserId);

        this.groupForm = {
          name: room.name || '',
          description: room.description || '',
          visibility: room.visibility || 'PRIVATE',
          avatarUrl: room.avatarUrl || '',
        };

        this.showGroupDetailsModal = true;
        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Failed to load group details:', err);
      },
    });
  }

  closeGroupDetailsModal() {
    this.showGroupDetailsModal = false;
    this.selectedGroupFile = null;
  }

  onGroupFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedGroupFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.groupForm.avatarUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveGroupDetails() {
    if (!this.isCurrentUserRoomAdmin) return;
    if (!this.selectedRoom) return;

    if (this.selectedGroupFile) {
      this.uploadingGroupAvatar = true;

      this.roomService.uploadGroupAvatar(this.selectedRoom.id, this.selectedGroupFile).subscribe({
        next: (res: any) => {
          this.roomService.updateRoomAvatar(this.selectedRoom.id, res.filePath).subscribe({
            next: () => {
              this.groupForm.avatarUrl = res.filePath;
              this.updateRoomDetailsOnly();
            },
            error: (err: any) => {
              console.error('Failed to update avatar:', err);
              this.uploadingGroupAvatar = false;
            },
          });
        },
        error: (err: any) => {
          console.error('Group avatar upload failed:', err);
          this.uploadingGroupAvatar = false;
        },
      });

      return;
    }

    this.updateRoomDetailsOnly();
  }

  updateRoomDetailsOnly() {
    if (!this.selectedRoom) return;

    this.roomService
      .updateRoom(this.selectedRoom.id, {
        name: this.groupForm.name,
        description: this.groupForm.description,
        visibility: this.groupForm.visibility,
      })
      .subscribe({
        next: (updatedRoom: any) => {
          this.selectedRoom = {
            ...this.selectedRoom,
            name: updatedRoom.name,
            description: updatedRoom.description,
            visibility: updatedRoom.visibility,
            avatarUrl: updatedRoom.avatarUrl,
            memberCount: this.selectedRoom.memberCount,
            onlineCount: this.selectedRoom.onlineCount,
          };

          this.rooms = this.rooms.map((room) => {
            if (String(room.roomId) === String(updatedRoom.roomId)) {
              return {
                ...room,
                name: updatedRoom.name,
                description: updatedRoom.description,
                visibility: updatedRoom.visibility,
                avatarUrl: updatedRoom.avatarUrl,
                memberCount: room.memberCount,
                onlineCount: room.onlineCount,
              };
            }
            return room;
          });

          this.uploadingGroupAvatar = false;
          this.closeGroupDetailsModal();
          this.cdr.detectChanges();
        },

        error: (err: any) => {
          console.error('Failed to update room:', err);
          this.uploadingGroupAvatar = false;
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
    /*
   Preserve current scroll position
  */
    const messagesArea = document.querySelector('.messages-area');

    const currentScrollTop = messagesArea ? messagesArea.scrollTop : 0;

    this.messageService.reactToMessage(event.messageId, event.emoji).subscribe({
      next: () => {
        /*
       Reload messages from backend
       so reaction rules stay correct
      */
        this.loadMessages(this.selectedRoom?.id);

        /*
       Restore scroll position after render
      */
        setTimeout(() => {
          if (messagesArea) {
            messagesArea.scrollTop = currentScrollTop;
          }
        }, 0);

        setTimeout(() => {
          if (messagesArea) {
            messagesArea.scrollTop = currentScrollTop;
          }
        }, 50);
      },

      error: (err) => {
        console.error('Reaction failed:', err);
      },
    });
  }

  resolveProfileImage(url?: string | null): string {
    if (!url || url.trim() === '') {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) {
      return url;
    }

    return '';
  }

  markNotificationAsRead(notification: any) {
    if (!notification || notification.read) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadNotificationCount = this.notifications.filter((n: any) => !n.read).length;
      },
      error: (err) => {
        console.error('Failed to mark notification as read:', err);
      },
    });
  }

  /*
 OPEN FORWARD MODAL
*/
  handleForwardMessage(message: any) {
    this.forwardingMessage = message;
    this.selectedForwardRooms = [];
    this.showForwardModal = true;
  }

  /*
 TOGGLE ROOM SELECTION FOR FORWARD
*/
  toggleForwardRoom(roomId: string) {
    if (this.selectedForwardRooms.includes(roomId)) {
      this.selectedForwardRooms = this.selectedForwardRooms.filter((id) => id !== roomId);
    } else {
      this.selectedForwardRooms = [...this.selectedForwardRooms, roomId];
    }
  }

  /*
 SUBMIT FORWARD
 Sends the message content to each selected room via WebSocket
*/
  submitForward() {
    if (!this.forwardingMessage || !this.selectedForwardRooms.length) return;

    this.forwardingInProgress = true;

    for (const roomId of this.selectedForwardRooms) {
      this.socketService.send({
        roomId,
        senderId: sessionStorage.getItem('userId'),
        senderName: sessionStorage.getItem('username') || 'User',
        avatarUrl: this.currentUser?.avatarUrl || '',
        content: this.forwardingMessage.content,
      });
    }

    this.forwardingInProgress = false;
    this.showForwardModal = false;
    this.forwardingMessage = null;
    this.selectedForwardRooms = [];
  }

  /*
 CLOSE FORWARD MODAL
*/
  closeForwardModal() {
    this.showForwardModal = false;
    this.forwardingMessage = null;
    this.selectedForwardRooms = [];
  }

  /*
 OPEN USER PROFILE VIEWER
 member: { userId, username, role? }
 role here is the ROOM role (ADMIN/MEMBER)
 which takes priority over system role from API
*/
  openUserProfile(member: any) {
    this.loadingUserProfile = true;
    this.showUserProfileModal = true;
    this.viewingUserProfile = null;

    /*
   ROOM ROLE RESOLUTION:
   1. If member already has a role (from members modal) → use it directly
   2. If coming from bubble avatar (only userId+username) →
      look up in roomMembers array which is already loaded
   3. Fallback to system role from API
  */
    const roomRole =
      member?.role ||
      this.roomMembers.find((m: any) => String(m.userId) === String(member.userId))?.role ||
      null;

    this.authService.getUserById(member.userId).subscribe({
      next: (user: any) => {
        this.viewingUserProfile = {
          ...user,
          avatarUrl: this.resolveProfileImage(user?.avatarUrl),
          role: roomRole || user?.role,
        };
        this.loadingUserProfile = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load user profile:', err);
        this.loadingUserProfile = false;
        this.viewingUserProfile = {
          username: member.username,
          avatarUrl: '',
          bio: '',
          fullName: '',
          role: roomRole || '',
        };
        this.cdr.detectChanges();
      },
    });
  }

  /*
 CLOSE USER PROFILE VIEWER
*/
  closeUserProfileModal() {
    this.showUserProfileModal = false;
    this.viewingUserProfile = null;
  }

  getRoomInitials(name: string): string {
    if (!name) return 'RM';
    return (
      name
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || '')
        .join('') || 'RM'
    );
  }

  private updateRoomLastMessage(roomId: string, message: string) {
    this.rooms = this.rooms.map((room: any) => {
      const currentRoomId = room.roomId || room.id;

      if (String(currentRoomId) === String(roomId)) {
        return {
          ...room,
          lastMessage: message,
        };
      }

      return room;
    });

    /*
   move active room to top
   WhatsApp / Discord style
  */
    this.rooms.sort((a: any, b: any) => {
      const aId = a.roomId || a.id;
      const bId = b.roomId || b.id;

      if (String(aId) === String(roomId)) return -1;
      if (String(bId) === String(roomId)) return 1;

      return 0;
    });
  }

  private getSidebarMessagePreview(message: any): string {
    if (!message?.content) {
      return 'No messages yet';
    }

    const content = String(message.content).toLowerCase();

    /*
   image
  */
    if (
      content.includes('.jpg') ||
      content.includes('.jpeg') ||
      content.includes('.png') ||
      content.includes('.gif') ||
      content.includes('.webp')
    ) {
      return '📷 Photo';
    }

    /*
   video
  */
    if (
      content.includes('.mp4') ||
      content.includes('.webm') ||
      content.includes('.mov') ||
      content.includes('.ogg')
    ) {
      return '🎥 Video';
    }

    /*
   file
  */
    if (content.startsWith('http')) {
      return '📎 File';
    }

    return `${message.senderName || 'User'}: ${message.content}`;
  }

  // On initial load, fetch the latest message for each room to display in the sidebar
  private hydrateSidebarLastMessages() {
    this.rooms.forEach((room: any) => {
      const roomId = room.roomId || room.id;

      if (!roomId) {
        room.lastMessage = 'No messages yet';
        return;
      }

      this.messageService.getMessagesByRoom(roomId, 0, 1).subscribe({
        next: (messages: any) => {
          if (messages && messages.length > 0) {
            /*
           size=1 pagination returns latest message
          */
            const latestMessage = messages[0];

            room.lastMessage = this.getSidebarMessagePreview(latestMessage);
          } else {
            room.lastMessage = 'No messages yet';
          }

          /*
         immutable refresh
        */
          this.rooms = [...this.rooms];

          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('Failed loading sidebar message for room:', roomId, err);

          room.lastMessage = 'No messages yet';

          this.rooms = [...this.rooms];

          this.cdr.detectChanges();
        },
      });
    });
  }
}
