// import { Router } from '@angular/router';
// import { Component } from '@angular/core';
// import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
// import { AuthService } from '../../../core/services/auth.service';
// import { InputComponent } from '../components/input.component';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, InputComponent],
//   templateUrl: './login.component.html',
//   styleUrls: ['./auth-pages.scss'],
// })
// export class LoginComponent {
//   loading = false;
//   error = '';

//   form!: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private auth: AuthService,
//     private router: Router,
//   ) {
//     this.form = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required],
//     });
//   }

//   submit() {
//     if (this.form.invalid) {
//       this.error = 'Please enter valid credentials';
//       return;
//     }

//     this.loading = true;
//     this.error = '';

//     this.auth.loginUser(this.form.value).subscribe({
//       next: (data: any) => {
//         if (!data?.token) throw new Error('Token missing');

//         localStorage.setItem('connecthub_token', data.token);
//         localStorage.setItem('userId', data.userId || '');

//         this.router.navigate(['/chat']);
//       },
//       error: (err) => {
//         this.error = err?.error?.message || err?.error?.error || 'Login failed';

//         this.loading = false;
//       },
//     });
//   }

//   googleLogin() {
//     window.location.href = this.auth.getGoogleLoginUrl();
//   }
// }
import { Router } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InputComponent } from '../components/input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./auth-pages.scss'],
})
export class LoginComponent {
  loading = false;
  error = '';

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.error = 'Please enter valid credentials';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.auth.loginUser(this.form.value).subscribe({
      next: (data: any) => {
        if (!data || !data.token) {
          this.error = 'Invalid email or password';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        localStorage.setItem('connecthub_token', data.token);
        localStorage.setItem('userId', data.userId || '');

        this.loading = false;
        this.cdr.detectChanges();

        this.router.navigate(['/chat']);
      },

      error: (err) => {
        this.error = err?.error?.message || err?.error?.error || 'Invalid email or password';

        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  googleLogin() {
    window.location.href = this.auth.getGoogleLoginUrl();
  }
}
