import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-list-item.component.html',
})
export class RoomListItemComponent {
  @Input() room: any;
  @Input() isActive: boolean = false;

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
