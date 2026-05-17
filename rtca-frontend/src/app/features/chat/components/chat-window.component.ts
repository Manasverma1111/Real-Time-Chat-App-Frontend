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

// CHAT WINDOW COMPONENT: this component is responsible for rendering the main chat interface, 
// including the chat header, message bubbles, and input area. 
// It handles user interactions such as sending messages, typing indicators, file uploads, 
// and message reactions. The component also manages the scroll behavior to ensure a smooth user experience 
// when new messages arrive or when the user scrolls through the chat history.
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

  // INPUTS: the component receives several input properties from its parent component, 
  // including the current chat room, the list of messages, the current user, 
  // and the typing status of other users. These inputs are used to render the chat interface 
  // and display relevant information to the user.
  @Input() room: any;
  @Input() messages: any[] = [];
  @Input() currentUser: any;
  @Input() typingUser = '';

  // OUTPUTS: the component emits various events to notify the parent component of user actions, 
  // such as sending a message, typing, uploading a file, deleting a message, reacting to a message, 
  // opening group details, loading more messages, managing room members, and viewing user profiles.
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
//  These events are emitted when the user interacts with the chat header options for managing room members and viewing profiles.
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

  // ngAfterViewInit: this lifecycle method is called after the component's view has been fully initialized. 
// It calls the forceScrollToBottom method to ensure that the chat window is scrolled to the bottom when it is first displayed, 
// allowing the user to see the latest messages immediately.
  ngAfterViewInit(): void {
    this.forceScrollToBottom();
  }

  private previousMessageCount = 0;

  // ngOnChanges: this lifecycle method is called whenever the input properties of the component change. 
// It checks for changes in the room and messages inputs to handle room changes and new messages respectively. 
// When the room changes, it resets the previousMessageCount and forces a scroll to the bottom of the chat. 
// When new messages are received, it checks if the user is near the bottom of the chat before deciding to auto-scroll, 
// ensuring that the user experience is not disrupted if they are reading older messages.
  ngOnChanges(changes: SimpleChanges): void {
    /*
   ROOM OPEN / REFRESH
  */
    if (changes['room'] && this.room) {
      this.previousMessageCount = this.messages.length;

      // force scroll to bottom on room change to show latest messages, 
      // with multiple timeouts to ensure it works even if messages are still loading.
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

  // ON SCROLL: this method is called whenever the user scrolls in the messages container. 
// It checks if the user has scrolled near the top of the container (within 120 pixels). 
// If so, it emits the loadMoreMessages event to notify the parent component to load older messages. 
// After loading more messages, it adjusts the scroll position to maintain the user's view.
  onScroll() {
    const container = this.messagesContainer?.nativeElement;

    if (!container) return;

    /*
    load older messages when near top
    */
  // check if user scrolled within 120px of top, if yes emit loadMoreMessages event to load older messages.
    if (container.scrollTop < 120) {
      const previousHeight = container.scrollHeight;

      this.loadMoreMessages.emit();

      setTimeout(() => {
        const newHeight = container.scrollHeight;

        container.scrollTop = newHeight - previousHeight;
      }, 100);
    }
  }

  // FORCE SCROLL TO BOTTOM: this method scrolls the messages container to the bottom. 
  // It is called after the view initializes and whenever new messages are received, 
  // ensuring that the user always sees the latest messages in the chat.
  forceScrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;

      if (!container) return;

      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Scroll failed:', err);
    }
  }

  // IS NEAR BOTTOM: this method checks if the user is currently scrolled near the bottom of the messages container. 
  // It calculates the distance from the bottom of the container and returns true if it is within a certain threshold (120 pixels in this case). 
  // This is used to determine whether to automatically scroll to the bottom when new messages arrive, 
  // following the behavior of popular chat applications like WhatsApp.
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

  // SEND MESSAGE: this method is called when the user clicks the send button or presses Enter in the message input. 
  // It checks if the message text is not empty and if a message is not already being sent. 
  // If the checks pass, it emits the sendMessage event with the message text to notify the parent component to send the message. 
  // The method also manages the sending state to prevent multiple sends at the same time.
  send() {
    if (!this.text.trim() || this.sending) return;

    const msg = this.text.trim();

    this.text = '';
    this.sending = true;

    this.sendMessage.emit(msg);

    this.sending = false;
  }

// TYPING INDICATOR: this method is called whenever the user types in the message input. 
// It emits a typing event to notify other users in the room that the current user is typing. 
// The method also implements a timeout to prevent excessive typing notifications, 
// ensuring that the typing status is only sent when the user is actively typing.
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
  onTyping() {
    this.typing.emit();
  }

  // File upload handler
  // This method is called when the user selects a file to upload. 
  // It emits the selected file to the parent component to handle the upload process.
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    // Check if a file was selected
    if (!input.files || !input.files.length) return;

    const file = input.files[0];
    this.uploadFile.emit(file);

    input.value = '';
  }

  // DELETE FOR ME: this handler is called when the user chooses to delete a message for themselves. 
  // It emits the deleteMessage event with the messageId to notify the parent component to mark the message as deleted for the current user.
  handleDeleteMessage(messageId: string) {
    this.deleteMessage.emit(messageId);
  }

  // DELETE FOR EVERYONE: this handler is called when the user chooses to delete a message for everyone. 
  // It emits the deleteForEveryone event with the messageId to notify the parent component to delete the message for all users in the room.
  handleDeleteForEveryone(messageId: string) {
    this.deleteForEveryone.emit(messageId);
  }

  // REACTION HANDLER: this method is called when the user reacts to a message with an emoji. 
  // It emits the reactMessage event with the messageId and the selected emoji to notify the parent component to update the message reactions.
  handleReaction(event: { messageId: string; emoji: string }) {
    this.reactMessage.emit(event);
  }

  /*
   Bubble emits the full message → pass up to ChatComponent
  */
//  This is needed because ChatComponent has the rooms list and needs to know which room to forward to 
// when user clicks forward in MessageBubbleComponent.
  handleForwardMessage(message: any) {
    this.forwardMessage.emit(message);
  }

  // VIEW PROFILE: when avatar is clicked in MessageBubbleComponent, 
  // this handler emits the sender's userId and username to the parent component to show the profile.
  handleViewProfile(sender: { userId: string; username: string }) {
    this.viewUserProfile.emit(sender);
  }
}
