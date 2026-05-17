import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InputComponent } from '../components/input.component';
import { CommonModule } from '@angular/common';

// LOGIN COMPONENT: this component provides the user interface and logic for the login page of the application. 
// It includes a form with email and password fields, as well as buttons for submitting the form and initiating Google login. The component handles form validation, displays error messages, and interacts with the AuthService to perform the login operation and manage user authentication state.
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
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // SUBMIT LOGIN FORM: this method is called when the user submits the login form. 
  // It first checks if the form is valid, and if not, it sets an error message. 
  // If the form is valid, it calls the loginUser() method of the AuthService with the form values. 
  // On successful login, it stores the token and user information in session storage, 
  // marks the user as online, and navigates to the chat page. 
  // If there is an error during login or fetching user details, it displays an appropriate error message.
  submit() {
    if (this.form.invalid) {
      this.error = 'Please enter valid credentials';
      return;
    }

    this.loading = true;
    this.error = '';

    // CALL LOGIN API
    this.auth.loginUser(this.form.value).subscribe({
      next: (data: any) => {
        if (!data?.token) {
          this.error = 'Login failed';
          this.loading = false;
          return;
        }

        // Store token
        sessionStorage.setItem('connecthub_token', data.token);
        sessionStorage.setItem('userId', data.userId || '');

        sessionStorage.setItem(
          'username',
          data.username || this.form.value.email.split('@')[0] || 'User',
        );

        /*
     Fetch user from backend to get role
    */
        this.auth.getCurrentUser().subscribe({
          next: (user: any) => {
            // ✅ Store full user (INCLUDING ROLE)
            sessionStorage.setItem('connecthub_user', JSON.stringify(user));

            /*
         MARK USER ONLINE
        */
            this.auth.markUserOnline(data.userId).subscribe({
              next: () => {},
              error: (err) => {
                console.error('Failed to mark user online', err);
              },
            });

            this.loading = false;
            this.router.navigate(['/chat']);
          },

          error: (err) => {
            console.error('Failed to fetch user after login', err);
            this.loading = false;
            this.router.navigate(['/chat']); // fallback (won’t break app)
          },
        });
      },

      error: (err) => {
        this.error = err?.error?.message || err?.error?.error || 'Invalid email or password';
        this.loading = false;
      },
    });
  }

  // GOOGLE LOGIN: this method is called when the user clicks the "Sign in with Google" button. 
  // It simply redirects the user to the Google login URL provided by the AuthService, 
  // which initiates the OAuth2 flow for Google authentication.
  googleLogin() {
    window.location.href = this.auth.getGoogleLoginUrl();
  }
}
