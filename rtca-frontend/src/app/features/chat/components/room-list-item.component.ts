import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/components/avatar.component';

// ROOM LIST ITEM COMPONENT: this component represents a single chat room in the list of rooms displayed in the sidebar. 
// It displays the room's avatar, name, last message, and unread message count. 
// The component receives the room information, active state, and unread count as inputs and emits an event when the user selects the room.
@Component({
  selector: 'app-room-list-item',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './room-list-item.component.html',
  styles: [
    `
      .room-item {
        width: 100%;
        padding: 9px 10px;
        display: flex;
        align-items: center;
        gap: 11px;
        border: none;
        border-radius: var(--radius-md);
        background: transparent;
        cursor: pointer;
        text-align: left;
        transition: background var(--transition);
        position: relative;
        margin-bottom: 2px;
      }

      .room-item:hover {
        background: var(--bg-hover);
      }

      .room-item.active {
        background: var(--bg-active);
      }

      .room-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 60%;
        background: var(--accent);
        border-radius: 0 3px 3px 0;
      }

      .room-avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        color: var(--text-secondary);
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        flex-shrink: 0;
        transition:
          background var(--transition),
          border-color var(--transition),
          color var(--transition);
      }

      .room-avatar.active {
        background: var(--accent-dim);
        border-color: rgba(200, 176, 138, 0.3);
        color: var(--accent);
      }

      .room-info {
        flex: 1;
        min-width: 0;
      }

      .room-name {
        font-family: var(--font-body);
        font-size: 13.5px;
        font-weight: 500;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .room-last-msg {
        font-size: 12px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }

      .unread-badge {
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        background: var(--accent);
        color: var(--text-inverse);
        border-radius: 9px;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    `,
  ],
})
export class RoomListItemComponent {

  // INPUTS FOR ROOM DATA AND STATE
  @Input() room: any;
  @Input() isActive: boolean = false;

  /*
   UNREAD COUNT per room
   passed from parent (ChatComponent → SidebarComponent)
  */
  @Input() unreadCount: number = 0;

  // OUTPUT FOR ROOM SELECTION
  @Output() select = new EventEmitter<any>();

  // initials: this computed property generates the initials to be displayed in the avatar when there is no image available. 
  // It first checks if the room has an avatar property and uses that. 
  // If not, it takes the room name, splits it into words, 
  // takes the first letter of the first two words, converts them to uppercase, and joins them together. 
  // If there is no name, it defaults to 'RM'.
  get initials(): string {
    return (
      this.room?.avatar ||
      this.room?.name
        ?.split(' ')
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase())
        .join('') ||
      'RM'
    );
  }

  /*
   SUPPORT ALL POSSIBLE BACKEND FIELDS
  */
//  avatarUrl: this computed property determines the URL of the avatar image to be displayed for the room.
  get avatarUrl(): string {
    return (
      this.room?.groupImageUrl ||
      this.room?.avatarUrl ||
      this.room?.imageUrl ||
      this.room?.profileImageUrl ||
      ''
    );
  }

  // onClick: this method is called when the user clicks on the room item. 
  // It emits the select event with the room information, allowing the parent component to handle the room selection and display the corresponding chat window.
  onClick() {
    this.select.emit(this.room);
  }
}
