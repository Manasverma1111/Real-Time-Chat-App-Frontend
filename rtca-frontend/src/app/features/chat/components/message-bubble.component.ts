import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-bubble.component.html',
  styles: [
    `
      .bubble-row {
        display: flex;
        justify-content: flex-start;
        margin-bottom: 6px;
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
    `,
  ],
})
export class MessageBubbleComponent {
  @Input() message: any;
}

// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-message-bubble',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './message-bubble.component.html',
// })
// export class MessageBubbleComponent {
//   @Input() message: any;
// }
