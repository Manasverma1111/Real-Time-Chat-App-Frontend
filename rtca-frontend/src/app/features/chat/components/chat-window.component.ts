import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChatHeaderComponent } from './chat-header.component';
import { MessageBubbleComponent } from './message-bubble.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatHeaderComponent, MessageBubbleComponent],
  templateUrl: './chat-window.component.html',
  styles: [
    `
      .chat-window {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--bg-base);
      }

      .messages-area {
        flex: 1;
        overflow-y: auto;
        padding: 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .empty-state {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
        gap: 10px;
      }

      .empty-icon {
        width: 60px;
        height: 60px;
        border-radius: 18px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        margin-bottom: 4px;
      }

      .empty-title {
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .empty-sub {
        font-size: 13px;
        color: var(--text-secondary);
      }

      .empty-sub strong {
        color: var(--accent);
        font-weight: 500;
      }

      .input-bar {
        padding: 12px 16px 16px;
        border-top: 1px solid var(--border-subtle);
        background: var(--bg-surface);
      }

      .input-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: var(--radius-lg);
        padding: 6px 6px 6px 16px;
        transition: border-color var(--transition);
      }

      .input-wrapper:focus-within {
        border-color: var(--border-strong);
      }

      .message-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: var(--text-primary);
        font-family: var(--font-body);
        font-size: 14px;
        padding: 4px 0;
      }

      .message-input::placeholder {
        color: var(--text-secondary);
      }

      .upload-btn,
      .send-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: var(--accent);
        color: var(--text-inverse);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition:
          opacity var(--transition),
          transform var(--transition);
      }

      .upload-btn {
        background: var(--bg-surface);
        color: var(--text-primary);
        border: 1px solid var(--border-default);
      }

      .send-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .send-btn:hover:not(:disabled) {
        opacity: 0.88;
        transform: scale(1.05);
      }

      .no-room {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 10px;
        text-align: center;
        padding: 24px;
      }

      .no-room-icon {
        width: 68px;
        height: 68px;
        border-radius: 20px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        margin-bottom: 4px;
      }

      .no-room-title {
        font-family: var(--font-display);
        font-size: 17px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .no-room-sub {
        font-size: 13px;
        color: var(--text-secondary);
        max-width: 240px;
        line-height: 1.5;
      }
    `,
  ],
})
export class ChatWindowComponent implements AfterViewChecked {
  @Input() room: any;
  @Input() messages: any[] = [];
  @Input() currentUser: any;
  @Input() typingUser = '';

  @Output() sendMessage = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<File>();

  /*
   NEW EVENTS FOR ROOM MEMBER MANAGEMENT
  */
  @Output() viewMembers = new EventEmitter<void>();
  @Output() leaveRoom = new EventEmitter<void>();
  @Output() deleteRoom = new EventEmitter<void>();

  @ViewChild('scrollEnd') scrollEnd!: ElementRef;

  private typingTimeout: any;

  text = '';
  sending = false;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.scrollEnd?.nativeElement?.scrollIntoView({
        behavior: 'smooth',
      });
    } catch {}
  }

  send() {
    if (!this.text.trim() || this.sending) return;

    const msg = this.text.trim();

    this.text = '';
    this.sending = true;

    this.sendMessage.emit(msg);

    this.sending = false;
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

  onTyping() {
    this.typing.emit();
  }

  // File upload handler
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files.length) return;

    const file = input.files[0];
    this.uploadFile.emit(file);

    input.value = '';
  }
}
