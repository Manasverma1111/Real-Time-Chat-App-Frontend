import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule],
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
  @Input() room: any;

  @Output() viewMembers = new EventEmitter<void>();
  @Output() leaveRoom = new EventEmitter<void>();
  @Output() deleteRoom = new EventEmitter<void>();
  @Output() openGroupDetails = new EventEmitter<void>();

  menuOpen = false;

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

  /*
   FINAL FIX:
   use backend fields memberCount + onlineCount
  */
  get roomMeta(): string {
    return `${this.room?.memberCount || 0} members • ${this.room?.onlineCount || 0} online`;
  }

  handleViewMembers() {
    this.viewMembers.emit();
  }

  handleLeaveRoom() {
    this.leaveRoom.emit();
  }

  handleDeleteRoom() {
    this.deleteRoom.emit();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  handleOpenGroupDetails() {
    this.menuOpen = false;
    this.openGroupDetails.emit();
  }
}
