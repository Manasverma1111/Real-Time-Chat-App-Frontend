import { Routes } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';
import { AuthComponent } from './pages/auth/auth.component';
import { OAuthSuccessComponent } from './pages/oauth-success/oauth-success.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'oauth-success', component: OAuthSuccessComponent },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: '**', redirectTo: 'chat' },
];
