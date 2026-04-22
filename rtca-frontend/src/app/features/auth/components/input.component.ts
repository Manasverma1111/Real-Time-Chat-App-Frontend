import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./app-input.scss'],
})
export class InputComponent {
  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() placeholder!: string;
  @Input() error!: string;
  @Input() control: any;

  showPass = false;

  get inputType() {
    if (this.type === 'password') {
      return this.showPass ? 'text' : 'password';
    }
    return this.type;
  }
}
