import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api/api.service';
import { Router } from '@angular/router';
import { SocketService } from '../../core/services/socket.service';

// ADMIN DASHBOARD COMPONENT: this component provides an interface for the super admin to manage users in the application. 
// It displays a list of all users, including their online/offline status, and allows the super admin to delete users. 
// The component also listens for presence updates via the SocketService to reflect real-time changes in user statuses. 
// It includes error handling for API calls and ensures that the socket connection is maintained while the component is active.
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  // STATE VARIABLES: these variables hold the list of users, loading state, and separate the super admin from normal users for display purposes.
  users: any[] = [];
  loading = false;
  superAdmin: any = null;
  normalUsers: any[] = [];

  private presenceSubscription: any;
  private retryTimer: any;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private socketService: SocketService,
  ) {}

  // ngOnInit: this lifecycle hook is called when the component is initialized. 
  // It first fetches the list of users from the backend API and then ensures that the socket connection is established to subscribe to presence updates. 
  // This allows the dashboard to display real-time online/offline statuses of users.
  ngOnInit() {
    this.fetchUsers();
    this.ensureSocketAndSubscribe();
  }

  // ngOnDestroy: this lifecycle hook is called when the component is destroyed. 
  // It cleans up any active subscriptions to prevent memory leaks and disconnects the socket connection if necessary. 
  // This ensures that the component does not continue to receive updates or hold resources after it has been removed from the view.
  ngOnDestroy() {
    if (this.presenceSubscription) {
      this.presenceSubscription.unsubscribe();
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  /*
   ENSURE SOCKET IS CONNECTED THEN SUBSCRIBE
   ChatComponent disconnects socket on destroy.
   Admin dashboard must reconnect if needed.
  */
  ensureSocketAndSubscribe() {
    const token = sessionStorage.getItem('connecthub_token') || '';

    /*
     Connect (or reconnect) the socket.
     SocketService.connect() is safe to call again —
     it creates a fresh STOMP client each time.
     Once connected, subscribe to presence events.
    */
    this.socketService.connect(
      token,
      () => {
        console.log('✅ Admin dashboard socket connected');
        this.subscribeToPresence();
      },
      (err) => {
        console.error('Admin dashboard socket error:', err);
        /*
         Retry connection after 2 seconds
        */
        this.retryTimer = setTimeout(() => {
          this.ensureSocketAndSubscribe();
        }, 2000);
      },
    );
  }

  // subscribeToPresence: this method subscribes to presence updates from the SocketService. 
  // Whenever a presence event is received (indicating that a user has come online or gone offline), 
  // it updates the status of the corresponding user in the normalUsers list or the superAdmin object. 
  // After updating the user statuses, it triggers change detection to update the UI accordingly.
  subscribeToPresence() {
    this.presenceSubscription = this.socketService.subscribePresence(
      (event: { userId: string; status: string }) => {
        console.log('👤 Admin presence:', event.userId, '→', event.status);

        this.normalUsers = this.normalUsers.map((user: any) => {
          if (String(user.userId) === String(event.userId)) {
            return { ...user, status: event.status };
          }
          return user;
        });

        if (this.superAdmin && String(this.superAdmin.userId) === String(event.userId)) {
          this.superAdmin = { ...this.superAdmin, status: event.status };
        }

        this.cdr.detectChanges();
      },
    );
  }

  // fetchUsers: this method is called when the component initializes to load the list of users from the backend API. 
  // It sets the loading state to true while the API call is in progress. 
  // Upon receiving a successful response, it separates the super admin user from the normal users and updates the component's state accordingly. 
  // If there is an error during the API call, it logs the error and resets the loading state.
  fetchUsers() {
    this.loading = true;

    this.api.get('/auth/super-admin/users').subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.data || [];
        this.superAdmin = data.find((u: any) => u.role === 'SUPER_ADMIN') || null;
        this.normalUsers = data.filter((u: any) => u.role !== 'SUPER_ADMIN');
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.loading = false;
      },
    });
  }

  // deleteUser: this method is called when the admin clicks the "Delete" button next to a user in the dashboard. 
  // It first shows a confirmation dialog to prevent accidental deletions. 
  // If the admin confirms, it makes an API call to delete the user by their ID. 
  // Upon successful deletion, it refreshes the user list by calling fetchUsers() again. 
  // If there is an error during deletion, it logs the error to the console.
  deleteUser(userId: string) {
    if (!confirm('Delete this user?')) return;

    this.api.delete(`/auth/super-admin/user/${userId}`).subscribe({
      next: () => {
        this.fetchUsers();
      },
      error: (err) => {
        console.error('Delete failed', err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/chat']);
  }
}
