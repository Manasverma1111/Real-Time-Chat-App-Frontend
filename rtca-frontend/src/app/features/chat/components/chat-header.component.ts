import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/components/avatar.component';

// CHAT HEADER COMPONENT: this component provides the user interface for the header of the chat window. 
// It displays the room name, member count, and online count, along with options for viewing members and managing the group. 
// The component receives the room information as input and emits events for actions like viewing members, 
// leaving the room, deleting the room, and opening group details.
@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './chat-header.component.html',
  styles: [
    `
      .chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        border-bottom: 1px solid var(--border-subtle);
        background: var(--bg-surface);
        flex-shrink: 0;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .room-avatar-sm {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-sm);
        background: var(--accent-dim);
        border: 1px solid rgba(200, 176, 138, 0.25);
        color: var(--accent);
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .header-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .room-title {
        font-family: var(--font-display);
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }

      .room-meta {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .meta-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .meta-dot.online {
        background: #4ade80;
      }

      .meta-text {
        font-size: 11.5px;
        color: var(--text-secondary);
      }

      .header-actions {
        display: flex;
        gap: 4px;
      }

      .icon-btn {
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: var(--radius-sm);
        background: transparent;
        color: var(--text-secondary);
        cursor: pointer;
        transition:
          background var(--transition),
          color var(--transition);
      }

      .icon-btn:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }
    `,
  ],
})
export class ChatHeaderComponent {

  // INPUT: room - this input property receives the room information from the parent component, 
  // which includes details like the room name, member count, online count, and avatar URL. 
  // The component uses this information to display the appropriate details in the header.
  @Input() room: any;

  // OUTPUT EVENTS: these event emitters allow the component to communicate user actions back to the parent component. 
  // viewMembers - emitted when the user clicks the option to view room members.
  // leaveRoom - emitted when the user clicks the option to leave the room.
  // deleteRoom - emitted when the user clicks the option to delete the room.
  // openGroupDetails - emitted when the user clicks the option to open group details.
  @Output() viewMembers = new EventEmitter<void>();
  @Output() leaveRoom = new EventEmitter<void>();
  @Output() deleteRoom = new EventEmitter<void>();
  @Output() openGroupDetails = new EventEmitter<void>();

  menuOpen = false;

  // COMPUTED PROPERTIES: these getters compute values based on the room information for display purposes.
  get initials(): string {
    return (
      this.room?.avatar ||
      this.room?.name
        ?.split(' ')
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase())
        .join('') ||
      'CH'
    );
  }

  // AVATAR URL: this getter computes the avatar URL for the room by checking multiple possible fields in the room object. 
  // It returns the first available URL or an empty string if none are found.
  get avatarUrl(): string {
    return (
      this.room?.groupImageUrl ||
      this.room?.avatarUrl ||
      this.room?.imageUrl ||
      this.room?.profileImageUrl ||
      ''
    );
  }

  /*
   use backend fields memberCount + onlineCount
  */
//  ROOM META: this getter constructs a string that displays the member count and online count for the room,
// using the memberCount and onlineCount fields from the room object.
  get roomMeta(): string {
    return `${this.room?.memberCount || 0} members • ${this.room?.onlineCount || 0} online`;
  }

  // HANDLERS FOR OUTPUT EVENTS: these methods are called when the corresponding user actions occur in the template. 
  // They emit the appropriate events to notify the parent component of the user's actions.
  handleViewMembers() {
    this.viewMembers.emit();
  }

  // LEAVE ROOM: this method is called when the user clicks the option to leave the room. 
  // It emits the leaveRoom event to notify the parent component that the user wants to leave the room.
  handleLeaveRoom() {
    this.leaveRoom.emit();
  }

  // DELETE ROOM: this method is called when the user clicks the option to delete the room. 
  // It emits the deleteRoom event to notify the parent component that the user wants to delete the room.
  handleDeleteRoom() {
    this.deleteRoom.emit();
  }

  // OPEN GROUP DETAILS: this method is called when the user clicks the option to open group details. 
  // It emits the openGroupDetails event to notify the parent component that the user wants to view the group details.
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // OPEN GROUP DETAILS: this method is called when the user clicks the option to open group details. 
  // It emits the openGroupDetails event to notify the parent component that the user wants to view the group details.
  handleOpenGroupDetails() {
    this.menuOpen = false;
    this.openGroupDetails.emit();
  }
}
