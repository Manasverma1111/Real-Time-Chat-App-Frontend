import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COLORS } from '../../../core/utils/constants';
import { StatusDotComponent } from './status-dot.component';

// AVATAR COMPONENT: this component is responsible for displaying user avatars throughout the application. 
// It accepts inputs for the user's initials, avatar size, background color, online status, and image URL. 
// The component also includes logic to handle image loading errors and fallback to displaying initials if the image fails to load.
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

  // fontSize: this computed property calculates the font size for the initials based on the avatar size. 
  // It uses a simple formula where the font size is 35% of the avatar size, 
  // ensuring that the initials are proportionally sized within the avatar.
  get fontSize(): number {
    return this.size * 0.35;
  }

  // handleImageError: this method is called when the avatar image fails to load. 
  // It sets the imageError flag to true, which triggers the component to display the user's initials instead of the image. 
  // This provides a fallback mechanism to ensure that there is always a visual representation of the user, 
  // even if their avatar image cannot be loaded.
  handleImageError() {
    this.imageError = true;
  }
}
