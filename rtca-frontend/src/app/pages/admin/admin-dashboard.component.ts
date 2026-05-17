import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api/api.service';
import { Router } from '@angular/router';

// ADMIN DASHBOARD COMPONENT: this component is responsible for displaying a list of all users in the system, 
// allowing the super admin to manage user accounts. 
// It fetches the user data from the backend API and displays it in a table format. 
// The super admin can delete user accounts directly from this dashboard, 
// and there is also a button to navigate back to the main chat page.
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  loading = false;
  superAdmin: any = null;
  normalUsers: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef, // ✅ added safely
  ) {}

  // ngOnInit: this lifecycle hook is called when the component is initialized. 
  // It calls the fetchUsers method to load the user data from the backend API as soon as the component is ready. 
  // This ensures that the admin dashboard displays the most up-to-date information about the users when it is accessed.
  ngOnInit() {
    this.fetchUsers();
  }

  // fetchUsers: this method is responsible for fetching the list of users from the backend API. 
  // It sets the loading state to true while the API request is in progress 
  // and updates the users array with the response data once it is received. 
  // The method also includes error handling to log any issues that occur during the API call. 
  // After successfully fetching the users, 
  // it calls detectChanges on the ChangeDetectorRef to ensure that the UI updates with the new data.
  fetchUsers() {
    this.loading = true;

    this.api.get('/auth/super-admin/users').subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : res?.data || [];

        // ✅ separate SUPER_ADMIN and others
        this.superAdmin = data.find((u: any) => u.role === 'SUPER_ADMIN') || null;
        this.normalUsers = data.filter((u: any) => u.role !== 'SUPER_ADMIN');

        this.loading = false;

        // ✅ ensure UI updates (safe, no side effects)
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.loading = false;
      },
    });
  }

  // deleteUser: this method is called when the super admin clicks the delete button for a user. 
  // It first shows a confirmation dialog to prevent accidental deletions. 
  // If the admin confirms, it sends a DELETE request to the backend API to remove the user account. 
  // After the deletion is successful, it calls fetchUsers again to refresh the list of users displayed on the dashboard. 
  // The method also includes error handling to log any issues that occur during the deletion process.
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

  // goBack: this method is called when the super admin clicks the "Back to Chat" button. 
  // It uses the Angular Router to navigate back to the main chat page. 
  // This provides a convenient way for the admin to return to the chat interface after managing user accounts.
  goBack() {
    this.router.navigate(['/chat']);
  }
}
