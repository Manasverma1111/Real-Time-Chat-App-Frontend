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
})
export class ChatWindowComponent implements AfterViewChecked {
  @Input() room: any;
  @Input() messages: any[] = [];
  @Input() currentUser: any;

  @Output() sendMessage = new EventEmitter<string>();

  @ViewChild('scrollEnd') scrollEnd!: ElementRef;

  text = '';
  sending = false;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    try {
      this.scrollEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
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
}
