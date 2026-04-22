// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';

// import { LoginComponent } from '../../features/auth/pages/login.component';
// import { SignupComponent } from '../../features/auth/pages/signup.component';

// @Component({
//   selector: 'app-auth',
//   standalone: true,
//   imports: [
//     CommonModule, // for *ngIf
//     LoginComponent, // child component
//     SignupComponent, // child component
//   ],
//   templateUrl: './auth.component.html',
//   styleUrls: ['./auth.component.scss'],
// })
// export class AuthComponent {
//   mode: 'login' | 'signup' = 'login';

//   //   switchMode(mode: 'login' | 'signup') {
//   //     this.mode = mode;
//   //   }
//   switchMode(mode: 'login' | 'signup') {
//     console.log('SWITCH CLICKED:', mode);
//     this.mode = mode;
//   }
// }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {}
