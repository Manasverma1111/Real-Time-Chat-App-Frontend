// import { Component } from '@angular/core';
// import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
// import { AuthService } from '../../../core/services/auth.service';
// import { InputComponent } from '../components/input.component';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-signup',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, InputComponent],
//   templateUrl: './signup.component.html',
//   styleUrls: ['./auth-pages.scss'],
// })
// export class SignupComponent {
//   loading = false;
//   error = '';
//   success = '';

//   form!: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private auth: AuthService,
//   ) {
//     this.form = this.fb.group({
//       fullName: ['', Validators.required],
//       username: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required],
//     });
//   }

//   submit() {
//     if (this.form.invalid) {
//       this.error = 'All fields required';
//       return;
//     }

//     this.loading = true;
//     this.error = '';
//     this.success = '';

//     this.auth.registerUser(this.form.value).subscribe({
//       next: () => {
//         this.success = 'Account created successfully';
//         this.form.reset();
//         this.loading = false;
//       },
//       error: (err) => {
//         this.error = err?.error?.message || err?.error?.error || 'Registration failed';

//         this.loading = false;
//       },
//     });
//   }

//   googleLogin() {
//     window.location.href = this.auth.getGoogleLoginUrl();
//   }
// }

import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InputComponent } from '../components/input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./auth-pages.scss'],
})
export class SignupComponent {
  loading = false;
  error = '';
  success = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    console.log('SUBMIT TRIGGERED'); // debug

    if (this.form.invalid) {
      this.error = 'All fields required';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    this.auth.registerUser(this.form.value).subscribe({
      next: () => {
        this.success = 'Account created successfully';
        this.form.reset();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Registration failed';
        this.loading = false;
      },
    });
  }

  googleLogin() {
    window.location.href = this.auth.getGoogleLoginUrl();
  }
}
