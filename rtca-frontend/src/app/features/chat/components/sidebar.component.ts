import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RoomListItemComponent } from './room-list-item.component';
import { Router } from '@angular/router';
import { isSuperAdmin } from '../../../core/utils/auth.util';
import { NotificationService } from '../../../core/services/notification.service';

// SIDEBAR COMPONENT: this component provides the user interface for the sidebar of the chat application. 
// It displays the list of chat rooms, a search bar for filtering rooms, and buttons for creating new chats, 
// accessing the admin panel (for super admins), viewing the user profile, and logging out.
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RoomListItemComponent],
  templateUrl: './sidebar.component.html',
  styles: [
    `
      .sidebar {
        width: 288px;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--bg-surface);
        border-right: 1px solid var(--border-subtle);
        flex-shrink: 0;
      }

      .sidebar-header {
        padding: 20px 18px 14px;
        border-bottom: 1px solid var(--border-subtle);
      }

      .brand-logo {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .brand-icon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: var(--accent);
        color: var(--text-inverse);
        font-family: var(--font-serif);
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 400;
        flex-shrink: 0;
      }

      .brand-label {
        font-family: var(--font-display);
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      .sidebar-search {
        padding: 12px 14px;
      }

      .search-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 11px;
        color: var(--text-muted);
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 8px 12px 8px 34px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 13px;
        outline: none;
        transition:
          border-color var(--transition),
          background var(--transition);
      }

      .search-input::placeholder {
        color: var(--text-muted);
      }

      .search-input:focus {
        border-color: var(--border-strong);
        background: var(--bg-hover);
      }

      .section-label {
        padding: 4px 18px 6px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-secondary);
        font-family: var(--font-display);
      }

      .sidebar-rooms {
        flex: 1;
        overflow-y: auto;
        padding: 2px 8px;
      }

      .rooms-loading {
        display: flex;
        gap: 5px;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .loading-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--text-muted);
        animation: pulse 1.2s ease-in-out infinite;
      }

      .loading-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .loading-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes pulse {
        0%,
        60%,
        100% {
          opacity: 0.3;
          transform: scale(0.85);
        }
        30% {
          opacity: 1;
          transform: scale(1);
        }
      }

      .sidebar-footer {
        padding: 12px 12px 16px;
        border-top: 1px solid var(--border-subtle);
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .btn-new-room {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        width: 100%;
        padding: 9px 14px;
        background: var(--accent);
        color: var(--text-inverse);
        border: none;
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition:
          opacity var(--transition),
          transform var(--transition);
      }

      .btn-new-room:hover {
        opacity: 0.88;
        transform: translateY(-1px);
      }

      .btn-logout {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        width: 100%;
        padding: 9px 14px;
        background: transparent;
        color: var(--text-primary);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-md);
        font-family: var(--font-body);
        font-size: 13px;
        cursor: pointer;
        transition:
          background var(--transition),
          color var(--transition),
          border-color var(--transition);
      }

      .btn-logout:hover {
        background: rgba(224, 112, 112, 0.08);
        color: #e07070;
        border-color: rgba(224, 112, 112, 0.2);
      }

      .btn-profile {
        color: var(--text-primary);
        border-color: var(--border-subtle);
      }

      .btn-profile:hover {
        background: var(--bg-hover);
      }
    `,
  ],
})
export class SidebarComponent {

  // INPUTS FOR ROOMS, USER INFO, AND NOTIFICATIONS
  @Input() rooms: any[] = [];
  @Input() selectedRoom: any;
  @Input() loadingRooms: boolean = false;
  @Input() publicGroups: any[] = [];
  @Input() notifications: any[] = [];
  @Input() unreadCount: number = 0;

  // OUTPUT EVENTS FOR USER ACTIONS IN THE SIDEBAR
  @Output() selectRoom = new EventEmitter<any>();
  @Output() logout = new EventEmitter<void>();
  @Output() createRoom = new EventEmitter<void>();
  @Output() openProfile = new EventEmitter<void>();
  @Output() joinGroup = new EventEmitter<any>();
  @Output() openNotifications = new EventEmitter<void>();

  search = '';

  constructor(
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  // filteredRooms: this computed property filters the list of rooms based on the search input. 
  // If the search input is empty, it returns the full list of rooms. 
  // Otherwise, it filters the rooms to include only those whose names contain the search string (case-insensitive).
  get filteredRooms() {
    if (!this.search.trim()) return this.rooms;
    return this.rooms.filter((r) => r.name.toLowerCase().includes(this.search.toLowerCase()));
  }

  /*
   COUNT UNREAD NOTIFICATIONS FOR A SPECIFIC ROOM
   Filters notifications by roomId and unread status.
   Called from template for each room in the list.
  */
  getUnreadCountForRoom(roomId: string): number {
    if (!this.notifications?.length) return 0;

    return this.notifications.filter((n: any) => !n.read && String(n.roomId) === String(roomId))
      .length;
  }

  // handleSelect: this method is called when the user clicks on a room in the sidebar. 
  // It emits the selectRoom event with the room information, 
  // allowing the parent component to handle the room selection and display the corresponding chat window.
  handleSelect(room: any) {
    this.selectRoom.emit(room);
  }

  // handleLogout: this method is called when the user clicks on the logout button in the sidebar. 
  // It emits the logout event to notify the parent component (ChatComponent) to perform the logout action, 
  // which typically involves clearing user data, tokens, and redirecting to the login page.
  handleLogout() {
    // delegate logout to parent (ChatComponent)
    this.logout.emit();
  }

  // handleCreateRoom: this method is called when the user clicks on the "New Chat" button in the sidebar. 
  // It emits the createRoom event to notify the parent component (ChatComponent) to open the room creation modal or page, 
  // allowing the user to create a new chat room.
  handleCreateRoom() {
    this.createRoom.emit();
  }

  // goToAdmin: this method is called when the user clicks on the admin panel button in the sidebar. 
  // It uses the Angular Router to navigate the user to the '/admin' route, which is where the admin panel is located. 
  // This allows users with admin privileges to access the admin features of the application.
  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  // isAdmin: this computed property checks if the current user has super admin privileges by calling the isSuperAdmin function from the auth utility. 
  // It is used in the template to conditionally display admin-only features or options in the sidebar, 
  // such as access to the admin panel or user management.
  get isAdmin() {
    return isSuperAdmin();
  }

  // handleOpenProfile: this method is called when the user clicks on the profile button in the sidebar. 
  // It emits the openProfile event to notify the parent component (ChatComponent) to open the user's profile page or panel, 
  // allowing the user to view and edit their profile information.
  handleJoinGroup(room: any) {
    this.joinGroup.emit(room);
  }

  // handleOpenNotifications: this method is called when the user clicks on the notifications button in the sidebar. 
  // It emits the openNotifications event to notify the parent component (ChatComponent) to open the notifications panel 
  // or page, allowing the user to view their notifications.
  handleOpenNotifications() {
    this.openNotifications.emit();
  }
}
