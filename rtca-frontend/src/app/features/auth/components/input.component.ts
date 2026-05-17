import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// INPUT COMPONENT: this component is a reusable input field that can be used in the login and registration forms.
// It accepts several inputs to customize its behavior and appearance, such as the label, type, placeholder, error message, and form control.
// The component also includes logic to toggle the visibility of password fields when the type is set to 'password'.
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./app-input.scss'],
})
export class InputComponent {

  // INPUT PROPERTIES: these properties allow the parent component to configure the input field.
  @Input() label!: string;
  @Input() type: string = 'text';
  @Input() placeholder!: string;
  @Input() error!: string;
  @Input() control: any;

  // STATE FOR TOGGLING PASSWORD VISIBILITY: 
  // this boolean variable is used to track whether the password is currently visible or hidden.
  showPass = false;

  // COMPUTED PROPERTY FOR INPUT TYPE: 
  // this getter returns the appropriate input type based on the current state of showPass and the specified type.
  get inputType() {
    if (this.type === 'password') {
      return this.showPass ? 'text' : 'password';
    }
    return this.type;
  }
}
