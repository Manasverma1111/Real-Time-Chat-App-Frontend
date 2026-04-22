import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COLORS } from '../../../core/utils/constants';

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
  @Input() status: string = 'INVISIBLE';
  @Input() size: number = 10;

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
