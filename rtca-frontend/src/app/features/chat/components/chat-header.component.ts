import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-header.component.html',
})
export class ChatHeaderComponent {
  @Input() room: any;
  @Input() activeRightPanel: string | null = null;
  @Output() panelChange = new EventEmitter<string>();
}
