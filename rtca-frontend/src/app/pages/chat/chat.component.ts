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

// CHAT COMPONENT: this is the main component for the chat page.
// It manages the state and logic for displaying chat rooms, messages, and notifications.
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
  // COMPONENT STATE
  rooms: any[] = [];
  selectedRoom: any = null;
  messages: any[] = [];
  publicGroups: any[] = [];
  loadingRooms = false;

  // SOCKET
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

  // TYPING INDICATOR
  typingUser = '';
  private typingSubscription: any;
  private typingTimer: any;

  // USER PROFILE
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

  // group avatar upload
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

   REAL-TIME NOTIFICATION SUBSCRIPTION
   Replaces polling interval
  */
  private notificationSubscription: any;

  // presence subscription
  private presenceSubscription: any;

  // seen subscription for marking notifications as read when user views them
  private seenSubscription: any;

  constructor(
    private roomService: RoomService,
    private messageService: MessageService,
    private socketService: SocketService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  // ngOnInit: this lifecycle hook is called when the component is initialized.
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

  // connectSocket: this method is responsible for establishing a WebSocket connection to the backend server using the SocketService.
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

    // CLEAN PRESENCE SUBSCRIPTION
    if (this.presenceSubscription) {
      this.presenceSubscription.unsubscribe();
    }

    // CLEAN SEEN SUBSCRIPTION
    if (this.seenSubscription) {
      this.seenSubscription.unsubscribe();
    }
  }

  // loadRooms: this method fetches the list of chat rooms that the user is a member of from the backend API using the RoomService.
  loadRooms() {
    this.loadingRooms = true;

    // added error handling and loading state management to room loading logic
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

        // TRY TO RESTORE LAST SELECTED ROOM:
        // this logic attempts to restore the last selected room for the user by checking localStorage for a saved room ID.
        const currentUserId = sessionStorage.getItem('userId');

        const savedRoomId = currentUserId
          ? localStorage.getItem(`selectedRoomId_${currentUserId}`)
          : null;

        // if a saved room ID exists, we check if it is still valid (i.e., the user is still a member of that room).
        if (savedRoomId) {
          const matchedRoom = this.rooms.find(
            (room: any) => String(room.roomId) === String(savedRoomId),
          );

          // if the saved room ID is valid, we automatically select that room and load its messages.
          if (matchedRoom) {
            this.selectRoom(matchedRoom);
            this.loadingRooms = false;
            this.cdr.detectChanges();
            return;
          }
        }

        // if there is no saved room ID or if the saved room ID is no longer valid,
        // we default to selecting the first room in the list (if any) and loading its messages.
        if (this.rooms.length > 0) {
          this.selectRoom(this.rooms[0]);
        }

        // after loading rooms, we also call hydrateSidebarLastMessages
        // to fetch the latest message for each room and display it in the sidebar.
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

  // loadPublicGroups: this method fetches the list of public chat groups from the backend API using the RoomService.
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

  // loadMessages: this method loads the messages for a specific chat room.
  // It supports pagination and can either reset the message list or append older messages based on the parameters passed.
  // The method also handles marking messages as seen and updating the notification state accordingly.
  // Error handling is included to manage any issues that arise during the API call to fetch messages.
  loadMessages(roomId: string, reset: boolean = true) {
    if (this.loadingOlderMessages) return;

    if (reset) {
      this.currentPage = 0;
      this.hasMoreMessages = true;
      this.messages = [];
    }

    this.loadingOlderMessages = true;

    // added error handling and loading state management to message loading logic
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

          // after loading messages for the first time,
          // we scroll to the bottom of the chat window to show the latest messages.
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

            // after marking messages as seen and updating notifications,
            // we call detectChanges to ensure the UI reflects the updated state.
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

  // loadOlderMessages: this method loads older messages for the currently selected chat room.
  loadOlderMessages() {
    if (!this.selectedRoom) return;

    if (!this.hasMoreMessages) return;

    this.loadMessages(this.selectedRoom.id, false);
  }

  // connectSocket: this method establishes a WebSocket connection and subscribes to real-time notifications.
  connectSocket() {
    const token = sessionStorage.getItem('connecthub_token');

    this.socketService.connect(
      token || '',
      () => {
        console.log('Socket connected');
        this.socketConnected = true;

        /*
         SUBSCRIBE TO REAL-TIME NOTIFICATIONS
         once socket is connected and userId known
        */
        const userId = sessionStorage.getItem('userId');

        // if a user ID is available, we subscribe to real-time notifications for that user using the SocketService.
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

        /*
       SUBSCRIBE TO REAL-TIME PRESENCE UPDATES
       Fires when any user goes ONLINE or OFFLINE.
       Silently re-fetches room list to update online counts
       in sidebar and chat header without breaking anything.
      */
        this.presenceSubscription = this.socketService.subscribePresence(
          (event: { userId: string; status: string }) => {
            console.log('👤 Presence:', event.userId, '→', event.status);
            this.refreshRoomOnlineCounts();
          },
        );
      },
      (err) => {
        console.error('WebSocket Error:', err);
        this.socketConnected = false;
      },
    );
  }

  /*
 SILENTLY REFRESH ONLINE COUNTS FOR ALL ROOMS
 Called when a presence event is received.
 Only updates onlineCount — does not re-render messages
 or change selected room.
*/
  private refreshRoomOnlineCounts() {
    this.roomService.getUserRooms().subscribe({
      next: (data: any) => {
        const updated = (data || []).map((room: any) => ({
          id: room.roomId || room.id,
          roomId: room.roomId,
          name: room.name,
          type: room.type,
          avatarUrl: room.avatarUrl || '',
          memberCount: room.memberCount || 0,
          onlineCount: room.onlineCount || 0,
          /*
         Preserve existing lastMessage so sidebar
         does not flicker back to 'Loading...'
        */
          lastMessage:
            this.rooms.find((r: any) => String(r.roomId || r.id) === String(room.roomId || room.id))
              ?.lastMessage || 'No messages yet',
        }));

        this.rooms = updated;

        /*
       Also update selectedRoom's online count
       so the chat header reflects it immediately
      */
        if (this.selectedRoom) {
          const fresh = updated.find(
            (r: any) =>
              String(r.roomId || r.id) === String(this.selectedRoom.roomId || this.selectedRoom.id),
          );
          if (fresh) {
            this.selectedRoom = {
              ...this.selectedRoom,
              onlineCount: fresh.onlineCount,
              memberCount: fresh.memberCount,
            };
          }
        }

        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  // subscribeToRoom: this method subscribes to real-time messages for a specific chat room using the SocketService.
  // It handles incoming messages by checking if they belong to the currently selected room and updating the message list accordingly.
  // The method also manages marking messages as seen and updating notifications when new messages are received while the user is in the room.
  subscribeToRoom(roomId: string) {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }

    /*
   UNSUBSCRIBE PREVIOUS SEEN SUBSCRIPTION
   when switching rooms
  */
    if (this.seenSubscription) {
      this.seenSubscription.unsubscribe();
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

      // when a new message is received via the WebSocket, we first check if it belongs to the currently selected room.
      // If it does, we determine if the message was sent by the current user and if it is from the same sender as the last message.
      // We then update the messages array to include the new message,
      // ensuring that the avatar is only shown for the first message in a group of messages from the same sender.
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

    /*
   SUBSCRIBE TO SEEN EVENTS FOR THIS ROOM
   When another user reads messages, backend broadcasts
   to /topic/seen/{roomId}. We update all own messages
   in this room to seen=true so ✓ becomes ✓✓ instantly.
  */
    this.seenSubscription = this.socketService.subscribeSeen(roomId, (event: any) => {
      const currentUserId = sessionStorage.getItem('userId');

      /*
       Only update if the reader is NOT the current user
       (we don't want to mark our own read as seen)
      */
      if (String(event.seenByUserId) === String(currentUserId)) {
        return;
      }

      console.log('👁 Seen event received for room:', event.roomId);

      /*
       Mark all own messages in this room as seen
      */
      this.messages = this.messages.map((msg: any) => {
        if (msg.isOwn) {
          return { ...msg, seen: true };
        }
        return msg;
      });

      this.cdr.detectChanges();
    });
  }

  // subscribeTyping: this method subscribes to typing indicators for a specific chat room using the SocketService.
  // It manages the display of typing indicators by showing the name of the user
  // who is typing and automatically hiding the indicator after a short period of inactivity.
  sendMessage(text: string) {
    if (!this.selectedRoom || !text.trim()) return;

    if (!this.socketConnected) {
      console.warn('Socket not connected');
      return;
    }

    // when the user sends a message, we first check if a room is selected and if the message text is not empty.
    // We also check if the WebSocket connection is established before attempting to send the message.
    // If all conditions are met, we use the SocketService to send the message to the backend server,
    // including relevant information such as the room ID, sender ID, sender name, avatar URL, and message content.
    this.socketService.send({
      roomId: this.selectedRoom.id,
      senderId: sessionStorage.getItem('userId'),
      senderName: sessionStorage.getItem('username') || 'User',
      avatarUrl: this.currentUser?.avatarUrl || '',
      content: text,
    });
  }

  // uploadMedia: this method handles the uploading of media files (such as images or videos) to the backend server.
  // It first checks if a room is selected and if the user ID is available.
  // It then creates a FormData object to hold the file and relevant information,
  // and uses the MessageService to upload the media.
  uploadMedia(file: File) {
    if (!this.selectedRoom) return;

    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    const formData = new FormData();
    formData.append('roomId', this.selectedRoom.id);
    formData.append('senderId', userId);
    formData.append('file', file);

    // when a media file is uploaded, we create a FormData object to hold the file
    // and relevant information such as the room ID and sender ID.
    // We then use the MessageService to upload the media to the backend server.
    // Upon successful upload, we send a message through the WebSocket with the file path of the uploaded media as the content.
    // Error handling is included to manage any issues that arise during the media upload process.
    this.messageService.uploadMedia(formData).subscribe({
      next: (res: any) => {
        console.log('✅ Upload response:', res);

        // after successfully uploading the media,
        // we send a message through the WebSocket with the file path of the uploaded media as the content.
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

  // handleCreateRoom: this method is called when the user clicks the button to create a new chat room.
  // It sets the state to show the create room modal, allowing the user to enter details for the new room.
  handleCreateRoom() {
    this.showCreateRoomModal = true;
  }

  // closeCreateRoomModal: this method is responsible for closing the create room modal
  // and resetting all related state variables to their default values.
  closeCreateRoomModal() {
    this.showCreateRoomModal = false;
    this.newRoomName = '';
    this.newRoomType = 'GROUP';
    this.userSearch = '';
    this.searchedUsers = [];
    this.selectedMembers = [];
  }

  // submitCreateRoom: this method is called when the user submits the form to create a new chat room.
  // It first checks if the room name is valid and if a room creation process is not already in progress.
  // It then uses the RoomService to send a request to the backend API to create the new room with the specified details.
  // Upon successful creation, it closes the modal and reloads the list of rooms to include the newly created room.
  // Error handling is included to manage any issues that arise during the room creation process.
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

  // loadPublicGroups: this method is responsible for loading the list of public chat groups.
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

  // joinGroup: this method is called when the user clicks the button to join a public chat group.
  // It uses the RoomService to send a request to the backend API to join the specified public group.
  // Upon successful joining, it reloads the list of rooms and public groups to reflect the change,
  // and removes the joined group from the list of public groups.
  // Error handling is included to manage any issues that arise during the process of joining a group.
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

  // handleLogout: this method is called when the user clicks the logout button.
  // It first retrieves the user ID from session storage and disconnects the WebSocket connection.
  // It then uses the AuthService to mark the user as offline in the backend, and finally logs the user out by clearing session storage and navigating to the login page.
  // Error handling is included to manage any issues that arise during the logout process, ensuring that the user is logged out even if there are errors in marking them as offline.
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

    // after attempting to mark the user as offline, we proceed to log the user out by clearing session storage and navigating to the login page.
    this.authService.logout().subscribe({
      next: () => {
        sessionStorage.removeItem('connecthub_token');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        this.router.navigate(['/login']);
      },

      // even if there is an error during the logout process,
      // we still want to ensure that the user is logged out on the client side by clearing session storage and navigating to the login page.
      error: () => {
        sessionStorage.removeItem('connecthub_token');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        this.router.navigate(['/login']);
      },
    });
  }

  // searchUsers: this method is called to search for users based on the input provided by the user.
  searchUsers() {
    if (!this.userSearch.trim()) {
      this.searchedUsers = [];
      return;
    }

    this.searchLoading = true;

    // when the user types in the search input to find users to add to a room,
    // we first check if the input is not empty.
    // If it is empty, we clear the search results.
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

  // addMember: this method is called when the user selects a user from the search results to add as a member to the new room being created.
  addMember(user: any) {
    this.selectedMembers = [...this.selectedMembers, user];
    this.userSearch = '';
    this.searchedUsers = [];
  }

  // removeMember: this method is called when the user clicks the button to remove a member from the list of selected members for the new room being created.
  removeMember(userId: string) {
    this.selectedMembers = this.selectedMembers.filter((m) => String(m.userId) !== String(userId));
  }

  // handleViewMembers: this method is called to view the members of the selected room.
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

  // closeMembersModal: this method is called to close the members modal.
  closeMembersModal() {
    this.showMembersModal = false;
    this.roomMembers = [];
    this.memberSearch = '';
    this.searchedNewMembers = [];
  }

  // handleLeaveRoom: this method is called when the user clicks the button to leave the currently selected room.
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

  // handleDeleteRoom: this method is called when the user clicks the button to delete the currently selected room.
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

  // searchNewMembers: this method is called to search for new members to add to the selected room.
  searchNewMembers() {
    if (!this.memberSearch.trim() || !this.selectedRoom) {
      this.searchedNewMembers = [];
      return;
    }

    // when the user types in the search input to find new members to add to the selected room,
    // we first check if the input is not empty and if a room is selected.
    // If either condition is not met, we clear the search results.
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

  // addMemberToExistingRoom: this method is called to add a member to the selected room.
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

  // removeMemberFromExistingRoom: this method is called to remove a member from the selected room.
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

  // handleTyping: this method is called when the user is typing a message in the input field.
  handleTyping() {
    if (!this.selectedRoom) return;

    this.socketService.sendTyping({
      roomId: this.selectedRoom.id,
      userName: sessionStorage.getItem('username') || 'User',
      typing: true,
    });
  }

  // subscribeTyping: this method subscribes to typing indicators for the selected room using the SocketService.
  subscribeTyping(roomId: string) {
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }

    this.typingSubscription = this.socketService.subscribeTyping(roomId, (event: any) => {
      const currentUser = sessionStorage.getItem('username') || 'User';

      if (event.userName === currentUser) {
        return;
      }

      // when a typing event is received via the WebSocket, we first check if the event is from the current user.
      // If it is, we ignore the event.
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

  // openProfileModal: this method is called when the user clicks the button to edit their profile.
  openProfileModal() {
    this.profileForm = {
      fullName: this.currentUser?.fullName || '',
      bio: this.currentUser?.bio || '',
      avatarUrl: this.resolveProfileImage(this.currentUser?.avatarUrl),
    };

    this.showProfileModal = true;
  }

  // closeProfileModal: this method is called to close the profile editing modal and reset any related state variables.
  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedProfileFile = null;
  }

  // onProfileFileSelected: this method is called when the user selects a new profile image file.
  onProfileFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedProfileFile = file;

    // when a new profile image file is selected, we create a FileReader to read the file and convert it to a data URL.
    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.avatarUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  // uploadProfileImageAndSave: this method is called to upload the new profile image
  //  (if one has been selected) and save the updated profile information.
  uploadProfileImageAndSave() {
    if (!this.selectedProfileFile) {
      this.saveProfile();
      return;
    }

    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    this.uploadingProfile = true;

    // when the user saves their profile, we first check if a new profile image file has been selected.
    // If a file has been selected, we use the AuthService to upload the profile image to the backend server.
    // Upon successful upload, we update the avatar URL in the profile form and proceed to save the profile information.
    // Error handling is included to manage any issues that arise during the profile image upload process.
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

  // saveProfile: this method is called to save the updated profile information to the backend server using the AuthService.
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

  // loadCurrentUser: this method is called to load the current user's information from the backend server using the AuthService.
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
   LOAD NOTIFICATIONS FROM DB ON STARTUP
   Called once on init to hydrate the list
  */
  loadNotifications(silent: boolean = false) {
    /*
   CRITICAL FIX FOR USERID INCONSISTENCY:
   Backend may return userId or id depending on the endpoint.
   Try both fields with fallback.
  */
    const userId = this.currentUser?.userId || this.currentUser?.id;

    if (!userId) {
      return;
    }

    // when the component initializes,
    // we call loadNotifications to fetch the existing notifications for the user from the backend database.
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
 OPEN NOTIFICATIONS MODAL
 Always re-fetch from DB first so
 notification.id values are real UUIDs
 (WebSocket payload ids are temporary)
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

  // closeNotificationsModal: this method is called to close the notifications modal.
  closeNotificationsModal() {
    this.showNotificationsModal = false;
  }

  // openGroupDetailsModal: this method is called to open the group details modal.
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

  // closeGroupDetailsModal: this method is called to close the group details modal and reset any related state variables.
  closeGroupDetailsModal() {
    this.showGroupDetailsModal = false;
    this.selectedGroupFile = null;
  }

  // onGroupFileSelected: this method is called when the user selects a new group avatar image file.
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

  // saveGroupDetails: this method is called to save the updated group details to the backend server.
  saveGroupDetails() {
    if (!this.isCurrentUserRoomAdmin) return;
    if (!this.selectedRoom) return;

    if (this.selectedGroupFile) {
      this.uploadingGroupAvatar = true;

      // when the user saves the group details, we first check if a new group avatar file has been selected.
      // If a file has been selected, we use the RoomService to upload the group avatar to the backend server.
      // Upon successful upload, we update the room's avatar URL with the new file path and proceed to update the room details.
      // Error handling is included to manage any issues that arise during the group avatar upload process.
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

  // updateRoomDetailsOnly: this method is called to update the group details (name, description, visibility) without changing the avatar.
  updateRoomDetailsOnly() {
    if (!this.selectedRoom) return;

    this.roomService
      .updateRoom(this.selectedRoom.id, {
        name: this.groupForm.name,
        description: this.groupForm.description,
        visibility: this.groupForm.visibility,
      })

      // after successfully updating the room details,
      // we update the selected room and the rooms list in the sidebar to reflect the changes.
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

          // we also update the rooms list in the sidebar to reflect the changes to the room details.
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

  // deleteMessageForMe: this method is called to delete a message for the current user.
  deleteMessageForMe(messageId: string) {
    this.messageService.deleteMessageForMe(messageId).subscribe(() => {
      this.messages = this.messages.filter((m) => m.id !== messageId);
    });
  }

  // deleteMessageForEveryone: this method is called to delete a message for everyone in the chat room.
  deleteMessageForEveryone(messageId: string) {
    console.log('Delete for everyone:', messageId);
  }

  // handleReaction: this method is called when the user reacts to a message with an emoji.
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

        // sometimes the scroll position resets after loading messages,
        // so we use a timeout to restore the scroll position after the messages have been rendered.
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

  // resolveProfileImage: this method is called to resolve the profile image URL for a user.
  resolveProfileImage(url?: string | null): string {
    if (!url || url.trim() === '') {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) {
      return url;
    }

    return '';
  }

  // markNotificationAsRead: this method is called to mark a specific notification as read.
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

    // when the user submits the forward message action, we first check if there is a message to forward and if any rooms have been selected.
    // If both conditions are met, we iterate over the selected rooms and send the message content to each room via the WebSocket using the SocketService.
    // After sending the messages, we reset the forwarding state and close the forward modal.
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

  // getRoomInitials: this method is called to generate the initials for a chat room based on its name,
  // which can be used for display purposes when the room does not have an avatar image.
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

  // updateRoomLastMessage: this method is called to update the last message preview for a specific room in the sidebar.
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

  // getSidebarMessagePreview: this method is called to generate a preview string for the last message in a room,
  // which is displayed in the sidebar.
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
