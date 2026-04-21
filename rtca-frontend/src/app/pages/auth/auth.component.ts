import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  mode: 'login' | 'signup' = 'login';

  switchMode(mode: 'login' | 'signup') {
    this.mode = mode;
  }
}
