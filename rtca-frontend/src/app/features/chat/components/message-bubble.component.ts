import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../shared/components/avatar.component';

// MESSAGE BUBBLE COMPONENT: this component is responsible for rendering individual message bubbles within the chat window. 
// It takes a message object as input and displays the message content, sender information, timestamps, and any media attachments. 
// The component also provides options for reacting to messages, deleting messages (for self or everyone), forwarding messages, and viewing the sender's profile.
@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './message-bubble.component.html',
  styles: [
    `
      .bubble-row {
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        margin-bottom: 2px;
        gap: 6px;
        padding-left: 2px;
      }

      .bubble-row.group-gap {
        margin-top: 8px; /* space between different users */
      }

      .bubble-row.own {
        justify-content: flex-end;
      }

      .bubble {
        max-width: 62%;
        padding: 10px 14px;
        border-radius: var(--radius-lg);
        position: relative;
        line-height: 1.5;
        overflow: hidden;
      }

      .bubble.other {
        background: var(--msg-other-bg);
        color: var(--msg-other-color);
        border-bottom-left-radius: 4px;
        border: 1px solid var(--border-subtle);
      }

      .bubble.own {
        background: var(--msg-own-bg);
        color: var(--msg-own-color);
        border-bottom-right-radius: 4px;
      }

      .sender-name {
        font-size: 11px;
        font-weight: 600;
        color: var(--accent);
        margin-bottom: 4px;
        font-family: var(--font-display);
        letter-spacing: 0.02em;
      }

      .bubble-text {
        font-size: 14px;
        word-break: break-word;
      }

      .bubble-time {
        font-size: 10px;
        text-align: right;
        margin-top: 5px;
        opacity: 0.55;
      }

      .media-image {
        display: block;
        width: 320px;
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin-top: 6px;
        object-fit: contain;
        cursor: pointer;
        background: #111;
      }

      .media-video {
        width: 100%;
        max-width: 320px;
        border-radius: 12px;
        margin-top: 6px;
      }

      .media-file {
        margin-top: 8px;
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-subtle);
      }

      .media-file a {
        color: inherit;
        text-decoration: none;
        font-size: 13px;
        word-break: break-word;
      }

      .media-file a:hover {
        text-decoration: underline;
      }

      /*
       AVATAR CLICKABLE CURSOR
      */
      .avatar-clickable {
        cursor: pointer;
        transition: opacity 0.15s ease;
      }

      .avatar-clickable:hover {
        opacity: 0.8;
      }

      /*
       IMAGE LIGHTBOX OVERLAY
      */
      .lightbox-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.92);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: zoom-out;
        padding: 20px;
      }

      .lightbox-img {
        max-width: 92vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
        cursor: default;
      }

      .lightbox-close {
        position: fixed;
        top: 18px;
        right: 22px;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.12);
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease;
        z-index: 100000;
      }

      .lightbox-close:hover {
        background: rgba(255, 255, 255, 0.22);
      }

      .lightbox-download {
        position: fixed;
        top: 18px;
        right: 68px;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.12);
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease;
        z-index: 100000;
        text-decoration: none;
      }

      .lightbox-download:hover {
        background: rgba(255, 255, 255, 0.22);
      }
    `,
  ],
})
export class MessageBubbleComponent {

  // INPUT: the component receives a message object as input, 
  // which contains all the necessary information to render the message bubble, 
  // such as the message content, sender information, timestamps, and media URLs. 
  // The component uses this input to determine how to display the message, 
  // including the text, media attachments, sender avatar, 
  // and any reactions or options associated with the message.
  @Input() message: any;

  // OUTPUTS FOR MESSAGE ACTIONS
  @Output() deleteForMe = new EventEmitter<string>();
  @Output() deleteForEveryone = new EventEmitter<string>();
  @Output() react = new EventEmitter<{ messageId: string; emoji: string }>();

  /*
   FORWARD EVENT
   Emits the full message so parent can show room picker
  */
  @Output() forward = new EventEmitter<any>();

  /*
   VIEW PROFILE EVENT
   Emits sender info when avatar is clicked
  */
  @Output() viewProfile = new EventEmitter<{ userId: string; username: string }>();

  showMenu = false;
  showReactions = false;

  /*
   IMAGE LIGHTBOX
  */
  showLightbox = false;
  lightboxUrl = '';

  // openLightbox: this method is called when the user clicks on an image in the message bubble. 
  // It sets the lightboxUrl to the URL of the clicked image and shows the lightbox overlay, 
  // allowing the user to view the image in a larger format.
  openLightbox(url: string) {
    this.lightboxUrl = url;
    this.showLightbox = true;
  }

  // closeLightbox: this method is called when the user clicks on the lightbox overlay or the close button. 
  // It resets the lightboxUrl and hides the lightbox, allowing the user to return to the chat view.
  closeLightbox() {
    this.showLightbox = false;
    this.lightboxUrl = '';
  }

  // toggleMenu: this method toggles the visibility of the message options menu 
  // when the user clicks on the menu button (three dots) on a message bubble.
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  // this will emit messageId so parent can handle deletion and update local state to remove the message from the UI, 
  // but it will not notify other users since it's only deleted for the current user.
  handleDeleteForMe() {
    this.deleteForMe.emit(this.message?.id);
    this.showMenu = false;
  }

  // this will emit messageId so parent can handle deletion and notify other users via socket, 
  // as well as update local state to remove the message from the UI.
  handleDeleteForEveryone() {
    this.deleteForEveryone.emit(this.message?.id);
    this.showMenu = false;
  }

  // this will emit messageId + emoji so parent can handle adding/removing reaction 
  // based on whether user has already reacted with that emoji
  handleForward() {
    this.forward.emit(this.message);
    this.showMenu = false;
  }

  /*
   AVATAR CLICKED — emit sender info up the chain
  */
//  This method is called when the user clicks on the sender's avatar in the message bubble. 
// It checks if the message has a senderId and then emits the viewProfile event with the sender's userId and username. 
// This allows the parent component to handle displaying the sender's profile when their avatar is clicked.
  handleViewProfile() {
    if (!this.message?.senderId) return;
    this.viewProfile.emit({
      userId: this.message.senderId,
      username: this.message.senderName || 'User',
    });
  }

// REACTION MENU: this method toggles the visibility of the reaction menu when the user clicks the reaction button on a message.
  toggleReactionMenu() {
    this.showReactions = !this.showReactions;
  }

  // emoji is the short code like 'thumbs_up'
  // we emit messageId + emoji so parent can handle adding/removing reaction based on whether user has already reacted with that emoji
  handleReaction(emoji: string) {
    this.react.emit({
      messageId: this.message?.id,
      emoji,
    });
    this.showReactions = false;
  }

  // SENDER AVATAR: this getter computes the avatar URL for the message sender 
  // by checking multiple possible fields in the message object. 
  // It returns the first available URL or an empty string if none are found. 
  // This allows the component to display the sender's avatar correctly, 
  // even if the message object has different field names for the avatar URL.
  getSenderAvatar(message: any): string {
    return (
      message?.avatarUrl ||
      message?.profileImageUrl ||
      message?.senderProfileImage ||
      message?.senderAvatar ||
      ''
    );
  }

  /*
 MEDIA TYPE HELPERS
 More robust media detection for S3 URLs
*/
// image detection based on common image file extensions 
  isImage(content: string): boolean {
    if (!content) return false;

    const url = content.toLowerCase();

    return (
      url.includes('.jpg') ||
      url.includes('.jpeg') ||
      url.includes('.png') ||
      url.includes('.gif') ||
      url.includes('.webp')
    );
  }

  // video detection based on common video file extensions, 
  // especially for S3 signed URLs that may not have clear extensions.
  isVideo(content: string): boolean {
    if (!content) return false;

    const url = content.toLowerCase();

    return (
      url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('.mov')
    );
  }

  // if it's not an image or video, but still a URL, treat it as a file. 
  // This covers cases where the file type is not easily determined from the URL, 
  // such as when using S3 signed URLs that may not have clear extensions.
  isFile(content: string): boolean {
    if (!content) return false;

    return content.startsWith('http') && !this.isImage(content) && !this.isVideo(content);
  }

  // extract file name from URL for display in file messages, with fallback to 'file' if it cannot be determined. 
  // This is used to show a user-friendly name for file attachments in the chat.
  getFileName(url: string): string {
    try {
      return decodeURIComponent(url.split('/').pop() || 'file');
    } catch {
      return 'file';
    }
  }
}
