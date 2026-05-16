import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COLORS } from '../../../core/utils/constants';
import { StatusDotComponent } from './status-dot.component';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, StatusDotComponent],
  templateUrl: './avatar.component.html',
})
export class AvatarComponent {
  @Input() initials: string = '';
  @Input() size: number = 36;
  @Input() color: string = COLORS.primary;
  @Input() status?: string;
  @Input() imageUrl?: string;

  /*
   FIX:
   fallback to initials if image fails
  */
  imageError = false;

  Math = Math;

  get fontSize(): number {
    return this.size * 0.35;
  }

  handleImageError() {
    this.imageError = true;
  }
}
