import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COLORS } from '../../../core/utils/constants';

// STATUS DOT COMPONENT: this component is a small visual indicator used to represent the online status of a user. 
// It accepts inputs for the user's status (e.g., online, away, do not disturb, invisible) and the size of the dot. 
// The component uses a method to determine the appropriate color for the status dot based on the user's status.
@Component({
  selector: 'app-status-dot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [ngStyle]="{
        display: 'inline-block',
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        background: getColor(),
        border: '2px solid #fff',
      }"
    ></span>
  `,
})
export class StatusDotComponent {

  // INPUTS FOR STATUS AND SIZE OF THE DOT
  @Input() status: string = 'INVISIBLE';
  @Input() size: number = 10;

  // getColor: this method returns the appropriate color for the status dot based on the user's online status. 
  // It uses a mapping of status values to colors defined in the COLORS constant. 
  // If the status does not match any of the predefined values, it defaults to the color for 'INVISIBLE'.
  getColor(): string {
    const map: any = {
      ONLINE: COLORS.online,
      AWAY: COLORS.away,
      DND: COLORS.dnd,
      INVISIBLE: COLORS.invisible,
    };

    return map[this.status] || COLORS.invisible;
  }
}
