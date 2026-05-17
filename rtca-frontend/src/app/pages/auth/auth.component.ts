import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// AUTH COMPONENT: this component serves as the main entry point for the authentication pages of the application. 
// It is a standalone component that imports the CommonModule for common Angular directives and the RouterModule for navigation. 
// The component's template and styles are defined in separate files (auth.component.html and auth.component.scss).
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {}
