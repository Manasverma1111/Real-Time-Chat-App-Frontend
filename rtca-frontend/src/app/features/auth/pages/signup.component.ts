import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InputComponent } from '../components/input.component';
import { CommonModule } from '@angular/common';

// SIGNUP COMPONENT: this component provides the user interface and logic for the signup page of the application. 
// It includes a form with fields for full name, username, email, and password, as well as a button 
// for submitting the form and initiating Google signup. 
// The component handles form validation, displays error messages, 
// and interacts with the AuthService to create a new user account and manage user authentication state.
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

  // SUBMIT SIGNUP FORM: this method is called when the user submits the signup form. 
  // It first checks if the form is valid, and if not, it sets an error message. 
  // If the form is valid, it calls the registerUser() method of the AuthService with the form values. 
  // On successful registration, it displays a success message and resets the form. 
  // If there is an error during registration, it displays an appropriate error message.
  submit() {
    console.log('SUBMIT TRIGGERED'); // debug

    if (this.form.invalid) {
      this.error = 'All fields required';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // CALL REGISTER API
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

  // GOOGLE SIGNUP: this method is called when the user clicks the "Sign up with Google" button. 
  // It simply redirects the user to the Google login URL provided by the AuthService, 
  // which initiates the OAuth2 flow for Google authentication.
  googleLogin() {
    window.location.href = this.auth.getGoogleLoginUrl();
  }
}
