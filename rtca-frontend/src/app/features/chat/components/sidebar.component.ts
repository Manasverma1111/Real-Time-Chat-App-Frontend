import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RoomListItemComponent } from './room-list-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RoomListItemComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() rooms: any[] = [];
  @Input() selectedRoom: any;
  @Input() loadingRooms: boolean = false;

  @Output() selectRoom = new EventEmitter<any>();
  @Output() logout = new EventEmitter<void>();
  @Output() createRoom = new EventEmitter<void>();

  search = '';

  get filteredRooms() {
    if (!this.search.trim()) return this.rooms;

    return this.rooms.filter((r) => r.name.toLowerCase().includes(this.search.toLowerCase()));
  }

  handleSelect(room: any) {
    this.selectRoom.emit(room);
  }

  handleLogout() {
    this.logout.emit();
  }

  handleCreateRoom() {
    this.createRoom.emit();
  }
}
