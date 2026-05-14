import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-list-item',
  standalone: true,
  imports: [CommonModule],
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
  @Input() room: any;
  @Input() isActive: boolean = false;

  /*
   UNREAD COUNT per room
   passed from parent (ChatComponent → SidebarComponent)
  */
  @Input() unreadCount: number = 0;

  @Output() select = new EventEmitter<any>();

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

  onClick() {
    this.select.emit(this.room);
  }
}
