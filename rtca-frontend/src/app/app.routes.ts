import { Routes } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';
import { AuthComponent } from './pages/auth/auth.component';
import { OAuthSuccessComponent } from './pages/oauth-success/oauth-success.component';
import { AuthGuard } from './guards/auth.guard';

import { LoginComponent } from './features/auth/pages/login.component';
import { SignupComponent } from './features/auth/pages/signup.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: SignupComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  { path: 'oauth-success', component: OAuthSuccessComponent },

  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
  },

  { path: '**', redirectTo: 'login' },
];
