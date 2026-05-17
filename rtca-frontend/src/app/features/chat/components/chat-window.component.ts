import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  AfterViewChecked,
  OnChanges,
  SimpleChanges,
  HostListener,
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
export class ChatWindowComponent implements AfterViewInit, OnChanges {
  @Input() room: any;
  @Input() messages: any[] = [];
  @Input() currentUser: any;
  @Input() typingUser = '';

  @Output() sendMessage = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();
  @Output() uploadFile = new EventEmitter<File>();
  @Output() deleteMessage = new EventEmitter<string>();
  @Output() reactMessage = new EventEmitter<{ messageId: string; emoji: string }>();
  @Output() openGroupDetails = new EventEmitter<void>();
  @Output() loadMoreMessages = new EventEmitter<void>();

  /*
   NEW EVENTS FOR ROOM MEMBER MANAGEMENT
  */
  @Output() viewMembers = new EventEmitter<void>();
  @Output() leaveRoom = new EventEmitter<void>();
  @Output() deleteRoom = new EventEmitter<void>();
  @Output() deleteForEveryone = new EventEmitter<string>();
  @Output() viewUserProfile = new EventEmitter<{ userId: string; username: string }>();

  /*
   FORWARD: emits the full message object
   to ChatComponent which owns the rooms list
  */
  @Output() forwardMessage = new EventEmitter<any>();

  // @ViewChild('scrollEnd') scrollEnd!: ElementRef;

  private typingTimeout: any;

  // private previousMessageCount = 0;

  text = '';
  sending = false;

  // ngAfterViewChecked() {
  //   if (this.messages.length > this.previousMessageCount) {
  //     this.previousMessageCount = this.messages.length;

  //     setTimeout(() => {
  //       this.scrollToBottom();
  //     });
  //   }
  // }

  // scrollToBottom() {
  //   try {
  //     this.scrollEnd?.nativeElement?.scrollIntoView({
  //       behavior: 'smooth',
  //     });
  //   } catch {}
  // }

  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef;

  ngAfterViewInit(): void {
    this.forceScrollToBottom();
  }

  private previousMessageCount = 0;

  ngOnChanges(changes: SimpleChanges): void {
    /*
   ROOM OPEN / REFRESH
  */
    if (changes['room'] && this.room) {
      this.previousMessageCount = this.messages.length;

      setTimeout(() => {
        this.forceScrollToBottom();
      }, 0);

      setTimeout(() => {
        this.forceScrollToBottom();
      }, 100);

      setTimeout(() => {
        this.forceScrollToBottom();
      }, 300);
    }

    /*
   NEW MESSAGE HANDLING
  */
    if (changes['messages']) {
      const currentCount = this.messages.length;

      /*
     ONLY actual new messages
    */
      if (currentCount > this.previousMessageCount) {
        const shouldScroll = this.isNearBottom();

        this.previousMessageCount = currentCount;

        /*
       WhatsApp behavior:
       scroll only if already near bottom
      */
        if (shouldScroll) {
          setTimeout(() => {
            this.forceScrollToBottom();
          }, 50);
        }
      }
    }
  }

  onScroll() {
    const container = this.messagesContainer?.nativeElement;

    if (!container) return;

    /*
    load older messages when near top
    */
    if (container.scrollTop < 120) {
      const previousHeight = container.scrollHeight;

      this.loadMoreMessages.emit();

      setTimeout(() => {
        const newHeight = container.scrollHeight;

        container.scrollTop = newHeight - previousHeight;
      }, 100);
    }
  }

  forceScrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;

      if (!container) return;

      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Scroll failed:', err);
    }
  }

  isNearBottom(): boolean {
    try {
      const container = this.messagesContainer?.nativeElement;

      if (!container) return true;

      const threshold = 120;

      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      return distanceFromBottom < threshold;
    } catch {
      return true;
    }
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

  handleDeleteMessage(messageId: string) {
    this.deleteMessage.emit(messageId);
  }

  handleDeleteForEveryone(messageId: string) {
    this.deleteForEveryone.emit(messageId);
  }

  handleReaction(event: { messageId: string; emoji: string }) {
    this.reactMessage.emit(event);
  }

  /*
   Bubble emits the full message → pass up to ChatComponent
  */
  handleForwardMessage(message: any) {
    this.forwardMessage.emit(message);
  }

  handleViewProfile(sender: { userId: string; username: string }) {
    this.viewUserProfile.emit(sender);
  }
}
