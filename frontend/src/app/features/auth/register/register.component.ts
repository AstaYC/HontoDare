// src/app/features/auth/register/register.component.ts
import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [RouterLink, FormsModule, HttpClientModule, NgIf],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  name = "";
  username = "";
  email = "";
  password = "";
  confirmPassword = "";
  errorMessage = "";
  successMessage = "";

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    // Clear previous messages
    this.errorMessage = "";
    this.successMessage = "";

    // Validate form fields
    if (!this.name || !this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = "All fields are required";
      return;
    }
    console.log(this.name, this.username, this.email, this.password, this.confirmPassword);

    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Passwords don't match";
      return;
    }

    // Call the auth service to register
    this.authService.register(this.name ,this.username, this.email, this.password).subscribe({
      next: (response) => {
        if (response) {
          this.successMessage = "Registration successful. Please login.";

          // Store username in local storage
          localStorage.setItem('username', this.username);
          localStorage.setItem('name', this.name);


          // Redirect to login page after short delay
          setTimeout(() => {
            this.router.navigate(["/login"]);
          }, 1500);
        } else {
          this.errorMessage = "Registration failed. Please try again.";
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || "Registration failed. Please try again.";
        console.error("Registration failed", error);
      },
    });
  }
}
