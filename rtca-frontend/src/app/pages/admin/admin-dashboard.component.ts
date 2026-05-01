import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef, // ✅ added safely
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.loading = true;

    this.api.get('/auth/super-admin/users').subscribe({
      next: (res: any) => {
        // ✅ handle both array & wrapped response safely
        //
        this.users = (Array.isArray(res) ? res : res?.data || []).sort((a: any, b: any) => {
          // SUPER_ADMIN first
          if (a.role === 'SUPER_ADMIN') return -1;
          if (b.role === 'SUPER_ADMIN') return 1;
          return 0;
        });

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
